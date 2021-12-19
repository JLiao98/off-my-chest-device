import React from 'react';
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
import { ChakraProvider } from '@chakra-ui/react'
import { MdFiberManualRecord, MdStopCircle, MdStop, MdLaunch } from "react-icons/md"



let final_transcript = '';

function App() {

    let SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    let recognition = new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = true;
    recognition.interimResults = true;

    const [transcript, setTranscript] = useState("Listening...")

    const renderSpeech = () => {
        recognition.start()
    }

    recognition.onresult = (event) => {
        let interim_transcript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }

            setTranscript(interim_transcript)
        }
    }

    return (
      <ChakraProvider>
        <head>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.3/p5.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.3/addons/p5.dom.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.3/addons/p5.sound.min.js"></script>
          <script src="https://ibm-nlu.glitch.me/nlu.js"></script>
          <meta charset="utf-8" />

        </head>
          <div className="App">
          <script src="sketch.js"></script>

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
                  fontSize={"2rem"}
                  
                  
                >
                <Flex
                  flexDirection={"column"}
                  justifyContent={"space-evenly"}
                  alignItems={"center"}
                  height={"100%"}
                  width={"100%"}
                  >

                  <Box>
                    <Flex flexDirection={"column"} justifyContent={"center"} alignItems={"center"}>
                    <Heading as={"h1"} size={"lg"} mb={4}>Off Your Chest</Heading>
                    <Text width="100%" fontSize='lg'>Anonymously record a thought you want to get off your chest and get meaningful feedback</Text>
                    </Flex>
                  
                  </Box>

                  <ButtonGroup spacing={"10"}
                  >
                    <Button 
                        colorScheme="green"
                        variant={"solid"}
                        padding={"10px"}
                        onClick={renderSpeech}
                        rightIcon={<MdFiberManualRecord/>}
                        width={"200px"}
                        height={"72px"}
                        fontSize={"1.5rem"}
                        >
                          Record
                        </Button>
                        
                        
                        <Button
                        colorScheme={"red"}
                        padding={"10px"}
                        variant={"solid"}
                        rightIcon={<MdStopCircle/>}
                        width={"200px"}
                        height={"72px"}
                        fontSize={"1.5rem"}
                        >
                          Stop
                        </Button>
                  </ButtonGroup>

                  

                    {/*<span id="final" className="text-black">transcript</span>*/}
                    <span id="interim" className="text-secondary">{transcript}</span>
                </Flex>


                </Center>
              
                <Center
                  
                  height={"100vh"}
                  color={"white"}
                  //border={"2px solid lightblue"}                  
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
                    <Heading as={"h1"} size={"lg"} mb={4}>Analyze Text</Heading>
                    <Text width="100%" fontSize='lg'>Generate information about the themes and emotions that a passage of text entails</Text>
                    </Flex>
                  
                  </Box>
                  <Textarea 
                    width={"50%"}
                    height={"250px"}
                    backgroundColor={"#E9ECF1"}
                    placeholder='<Text to analyze>'></Textarea>
                  <Button
                    colorScheme={"blue"} 
                    width={"244px"}
                    height={"72px"}
                    fontSize={"1.5rem"}
                    rightIcon={<MdLaunch/>}
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
