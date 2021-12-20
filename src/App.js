import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import {
    Flex, Box, Center, Button, ButtonGroup, Stack, Heading, Text,
    FormControl, FormLabel, Textarea,
    Select,
    Spacer,
} from "@chakra-ui/react";
import './App.css';
import './utils/language'
import {useState} from "react";
import {ChakraProvider} from '@chakra-ui/react'
import {MdFiberManualRecord, MdStopCircle, MdStop, MdLaunch} from "react-icons/md"
import {addPost, uploadAudio} from "./utils/firebase";
import {nanoid} from "nanoid";
import ReactRevealText from "react-reveal-text/lib/ReactRevealText";


let final_transcript = ''
let recording = false
let chunks = []
let mediaRecorder
let audio_url = ''
let response
let pid = ''

function nlu(params, callback = console.log) {
    if (typeof params === 'string') params = {text: params}

    // https://console.bluemix.net/apidocs/natural-language-understanding?language=node#text-analytics-features
    params.features = params.features || {
        categories: {},
        concepts: {},
        emotion: {document: true},
        entities: {mentions: true, emotion: true, sentiment: true},
        keywords: {emotion: true, sentiment: true},
        relations: {},
        sentiment: {document: true},
        semantic_roles: {},
        syntax: {
            sentences: true,
            tokens: {
                lemma: true,
                part_of_speech: true
            }
        }
    }

    if (params.url)
        params.features.metadata = {}

    const req = new Request('https://ibm-nlu.glitch.me/', {
        method: 'POST',
        mode: 'cors',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(params)
    })

    fetch(req)
        .then(response => response.json())
        .then(json => callback(json))
        .catch(e => console.log(e))
}

function App() {

    let SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    let recognition = new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = true;
    recognition.interimResults = true;

    const [transcript, setTranscript] = useState("Please click Record to start recording...")
    const [finalTranscript, setFinalTranscript] = useState("<Text to analyze>")
    const [show, setShow] = useState(false)
    const [showBtn, setShowBtn] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setShow(true)
        }, 1500)
        setTimeout(() => {
            setShowBtn(true)
        }, 3500)
    }, []);


    const renderSpeech = () => {
        recording = true
        recognition.start()

        final_transcript = ''
        setFinalTranscript(final_transcript)

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log("getUserMedia supported.");
            navigator.mediaDevices
                .getUserMedia(
                    // constraints - only audio needed for this app
                    {
                        audio: true
                    }
                )

                // Success callback
                .then(function (stream) {
                    mediaRecorder = new MediaRecorder(stream);

                    mediaRecorder.start();
                    console.log(mediaRecorder.state);
                    console.log("recorder started");

                    mediaRecorder.onstop = function (e) {
                        console.log("recorder stopped");
                    };

                    mediaRecorder.ondataavailable = function (e) {
                        chunks.push(e.data);
                    };
                })

                // Error callback
                .catch(function (err) {
                    console.log("The following getUserMedia error occurred: " + err);
                });
        } else {
            console.log("getUserMedia not supported on your browser!");
        }
    }

    const stopSpeech = () => {
        recording = false
        recognition.stop()
        mediaRecorder.stop();
        setTranscript("You have stopped the recording...")
        console.log(mediaRecorder.state);
        console.log("recorder stopped");
        chunks = []
    }

    const handleNLU = () => {
        nlu(final_transcript, nluComplete)
    }

    const handleAddPost = () => {

        // ==== SENTIMENT ANALYSIS ====
        let sentiment = response.result.sentiment.document;
        console.log(sentiment)

        let positiveness = Math.round(sentiment.score * 100) + "%"
        console.log(positiveness)


        // ==== CATEGORIES ANALYSIS ====
        let category = response.result.categories[0];
        console.log(category)


        // ==== EMOTION ANALYSIS ====
        if (response.result.emotion) { // only with English texts
            let emotion = response.result.emotion.document.emotion;
            console.log(emotion)
        }

        let level1, level2, level3, level4, level5
        let cat = category.label.split('/')
        for (let i = 1; i < 6; i++) {
            // eslint-disable-next-line default-case
            switch (i) {
                case 1:
                    level1 = cat[1]
                    break
                case 2:
                    level2 = cat[2]
                    break
                case 3:
                    level3 = cat[3]
                    break
                case 4:
                    level4 = cat[4]
                    break
                case 5:
                    level5 = cat[5]
                    break
            }
        }
        const blob = new Blob(chunks, {type: "audio/ogg; codecs=opus"})

        pid = nanoid()

        uploadAudio(category.label, pid, blob).then(url => {
            audio_url = url
        })

        addPost(pid, audio_url, final_transcript, level1, level2, level3, level4, level5, response).then(r => {
            console.log(r)
        })
    }

    const nluComplete = (result) => {
        response = result
        console.log(response)
        handleAddPost()

    }


    recognition.onresult = (event) => {

        if (recording) {
            let interim_transcript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript + '.';
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }

            }
            setTranscript(interim_transcript)
            setFinalTranscript(final_transcript)
        }

    }

    const renderButton = () => {
        if (!showBtn) {
            return (
                <ButtonGroup spacing={"10"} className='hidden'
                >
                    <Button
                        colorScheme="green"
                        variant={"solid"}
                        padding={"10px"}
                        onClick={renderSpeech}
                        rightIcon={<MdFiberManualRecord/>}
                        width={"150px"}
                        height={"60px"}
                        fontSize={"1.5rem"}
                    >
                        <ReactRevealText show={show}>
                            Record
                        </ReactRevealText>
                    </Button>

                    <Button
                        colorScheme={"red"}
                        padding={"10px"}
                        variant={"solid"}
                        rightIcon={<MdStopCircle/>}
                        width={"150px"}
                        height={"60px"}
                        fontSize={"1.5rem"}
                        onClick={stopSpeech}
                    >
                        <ReactRevealText show={show}>   
                          Stop
                        </ReactRevealText>
                    </Button>
                </ButtonGroup>


            )
        }
        else{
          return(
            <ButtonGroup spacing={"10"} className='fade-in'
            >
                <Button
                    colorScheme="green"
                    variant={"solid"}
                    padding={"10px"}
                    onClick={renderSpeech}
                    rightIcon={<MdFiberManualRecord/>}
                    width={"150px"}
                    height={"60px"}
                    fontSize={"1.5rem"}
                >
                    <ReactRevealText show={show}>
                        Record
                    </ReactRevealText>
                </Button>

                <Button
                    colorScheme={"red"}
                    padding={"10px"}
                    variant={"solid"}
                    rightIcon={<MdStopCircle/>}
                    width={"150px"}
                    height={"60px"}
                    fontSize={"1.5rem"}
                    onClick={stopSpeech}
                >
                    <ReactRevealText show={show}>   
                      Stop
                    </ReactRevealText>
                </Button>
            </ButtonGroup>
          )
        }

    }


    return (
        <ChakraProvider>
            <div className="App">
                <header className="App-header">


                    <Center
                        height={"100%"}
                        width={"100%"}
                        className="gradient"
                    >
                        <Flex flexDirection={"column"}>
                            <Center
                                width={"100vw"}
                                height={"100vh"}
                                color={"white"}
                                fontSize={"1.5rem"}
                                //border={"2px solid white"}
                            >
                                <Flex
                                    flexDirection={"column"}
                                    justifyContent={"space-evenly"}
                                    alignItems={"center"}
                                    height={"100%"}
                                    width={"100%"}
                                    //border={"2px solid white"}
                                >
                                    <Box>
                                        <Flex flexDirection={"column"} justifyContent={"center"} alignItems={"center"}>

                                            <Heading as={"h1"} fontSize={"50px"} mb={6}>
                                                <ReactRevealText show={show}>
                                                    Off Your Chest
                                                </ReactRevealText>
                                            </Heading>
                                            <p></p>
                                            <Heading as={"h2"} fontSize={"28px"} fontWeight={"normal"}>
                                                <ReactRevealText show={show}>
                                                    Hello, this is a safe place to tell your story
                                                </ReactRevealText>

                                            </Heading>
                                        </Flex>

                                    </Box>

                                    {renderButton()}

                                    {/*<span id="final" className="text-black">transcript</span>*/}
                                    <span id="interim"
                                          className="text-secondary"
                                          >
                                        <ReactRevealText show={show}>
                                               {transcript ? transcript : '...'}
                                            </ReactRevealText>
                                    </span>
                                </Flex>


                            </Center>

                            <Center

                                height={"100vh"}
                                color={"white"}
                                //border={"2px solid lightblue"}
                                id="pg2"
                            >
                                <Flex

                                    width={"100%"}
                                    height={"75%"}
                                    flexDirection={"column"}
                                    alignItems={"center"}
                                    justifyContent={"space-between"}
                                >

                                    <Box>
                                        <Flex flexDirection={"column"} justifyContent={"center"} alignItems={"center"}>
                                            <Heading as={"h1"} size={"2xl"} mb={4}>Analyze Text</Heading>
                                            <Text width="100%" fontSize='2xl'>Utilize NLP to analyze the topics and
                                                emotions that the passage entails</Text>
                                        </Flex>

                                    </Box>
                                    <Textarea
                                        width={"50%"}
                                        height={"250px"}
                                        value={finalTranscript}
                                        backgroundColor={"#E9ECF1"}
                                        textColor={"black"}
                                        isReadOnly={true}
                                    />
                                    <Button
                                        colorScheme={"blue"}
                                        width={"244px"}
                                        color={"white"}
                                        height={"72px"}
                                        fontSize={"1.5rem"}
                                        rightIcon={<MdLaunch/>}
                                        onClick={handleNLU}
                                    >
                                        Launch Analysis
                                    </Button>
                                </Flex>

                            </Center>
                        </Flex>

                    </Center>


                </header>
            </div>
        </ChakraProvider>
    );
}

export default App;
