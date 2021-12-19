import React from 'react';
import ReactDOM from 'react-dom';
import {
    Flex,
    FormControl, FormLabel,
    Select,
} from "@chakra-ui/react";
import './App.css';
import './utils/language'
import {useState} from "react";

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
        <div className="App">
            <header className="App-header">
                <Flex
                    direction="column"
                    minH="100vh"
                    align="center"
                    justify={"center"}
                    pt={{sm: "120px", md: "75px"}}
                >
                    <button onClick={renderSpeech}>Press to Talk</button>

                    {/*<span id="final" className="text-black">transcript</span>*/}
                    <span id="interim" className="text-secondary">{transcript}</span>


                </Flex>
            </header>
        </div>
    );
}

export default App;
