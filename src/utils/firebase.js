// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {
    getFirestore,
    doc,
    setDoc
} from "firebase/firestore";
import {getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL} from "firebase/storage";

import {nanoid} from "nanoid";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBmgT5tpv5u6FVKczJbL570EX-tgSOjc44",
    authDomain: "off-my-chest.firebaseapp.com",
    projectId: "off-my-chest",
    storageBucket: "off-my-chest.appspot.com",
    messagingSenderId: "1087542841850",
    appId: "1:1087542841850:web:8f3b3d7e978bebad499443",
    measurementId: "G-GPC2R64T65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);


const addPost = async (pid, audio_link, transcript, level1, level2, level3, level4, level5, nlu_analysis) => {
    try {
        await setDoc(doc(db, "posts", pid), {
            pid: pid,
            audio_file: audio_link ? audio_link : '',
            transcript: transcript,
            level1: level1 ? level1 : '',
            level2: level2 ? level2 : '',
            level3: level3 ? level3 : '',
            level4: level4 ? level4 : '',
            level5: level5 ? level5 : '',
            nlu_analysis: nlu_analysis ? nlu_analysis : null
        })
        return pid
    } catch (err) {
        throw err
    }
}


const uploadAudio = async (path, pid, file) => {
    const storageRef = ref(storage, path + '/' + pid + '.ogg');

    //const uploadTask = uploadBytesResumable(storageRef, file);

    let result = await uploadBytes(storageRef, file)
    let downloadURL = await getDownloadURL(result.ref)

    return downloadURL

// Register three observers:
// 1. 'state_changed' observer, called any time the state changes
// 2. Error observer, called on failure
// 3. Completion observer, called on successful completion
//     uploadTask.on('state_changed',
//         (snapshot) => {
//             // Observe state change events such as progress, pause, and resume
//             // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
//             const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//             console.log('Upload is ' + progress + '% done');
//             switch (snapshot.state) {
//                 case 'paused':
//                     console.log('Upload is paused');
//                     break;
//                 case 'running':
//                     console.log('Upload is running');
//                     break;
//             }
//         },
//         (error) => {
//             console.log('Upload failed');
//             // Handle unsuccessful uploads
//         },
//         () => {
//             // Handle successful uploads on complete
//             // For instance, get the download URL: https://firebasestorage.googleapis.com/...
//             getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
//                 console.log('File available at', downloadURL);
//             });
//         }
//     );

}

export {addPost, uploadAudio}