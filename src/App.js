
import {
  ChakraProvider,
  Center, VStack, Heading, Box,
  FormControl, FormLabel, Input,
  FormHelperText, Link, Button,
  FormErrorMessage, Text
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { useFormik } from 'formik';
import { object, string } from 'yup';
import ReactPlayer from 'react-player'



function App() {

  const [defaultAudio, setDefaultAudio] = useState(null);
  const [playerURL, setPlayerURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState();

  const api = 'https://api.gladia.io/v2'
      , format = new RegExp('^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$')
      , providedFile = 'rimbaud-sensation.wav'
      ;

  useEffect(() => {
    (async () => {
      setDefaultAudio(
        new File([await (await fetch('/' + providedFile)).blob()], providedFile, { type: 'audio/wav' })
      )
    })()
  }, []);
  


  const formik = useFormik({
    initialValues: {
      key: '',
      file: ''
    },
    onSubmit: async values => {
      const data = new FormData();
      data.append("audio", values.file || defaultAudio);
      setPlayerURL(URL.createObjectURL(values.file || defaultAudio));
      setResponse(false);
      setLoading(true);
      try {


        // Task 1 - Main Part of the API Integration - START


        const upload = await fetch(api + '/upload', {
          method: 'POST',
          headers: { 'x-gladia-key': values.key },
          body: data
        }).then(r => r.json());


        const transcription = await fetch(api + '/transcription', {
          method: 'POST',
          headers: {
            'x-gladia-key': values.key,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ audio_url: upload.audio_url })
        }).then(r => r.json());


        const repeat = () => {
          const check = setTimeout(async () => {
            const actual = await fetch(transcription.result_url, {
              method: 'GET',
              headers: { 'x-gladia-key': values.key }
            }).then(r => r.json());
            clearTimeout(check);
            if (actual.status === 'done') {
              setResponse(actual.result.transcription.full_transcript);
              setLoading(false)
            } else repeat()
          }, 500)
        }
        repeat()


        // Task 1 - Main Part of the API Integration - END


      } catch (error) {
        setResponse(error);
        setLoading(false)
      }
    },
    validationSchema: object({
      key: string().matches(format, "Does not match the Gladia format").required("Required")
    })
  });



  return (
    <ChakraProvider>
      <Center>
        <VStack>


          <Heading as='h1' size='xl' mt='20'>Speech-to-Text API</Heading>


          <Box w="320">
            <form onSubmit={formik.handleSubmit}>

              <FormControl mt='10' isInvalid={formik.touched.key && formik.errors.key} isRequired>
                <FormLabel htmlFor='key'>Enter your Gladia API key</FormLabel>
                <Input
                  id='key'
                  name='key'
                  type='text'
                  onChange={formik.handleChange}
                  value={formik.values.key}
                />
                <FormHelperText>
                  Generate your key from <Link color='blue' href='https://app.gladia.io/account'>your account</Link>.
                </FormHelperText>
                <FormErrorMessage>{formik.errors.key}</FormErrorMessage>
              </FormControl>
              
              <FormControl mt='10'>
                <FormLabel htmlFor='file'>Select an audio file</FormLabel>
                <input
                  id='file'
                  name='file'
                  type='file' accept='audio/*'
                  onChange={(event) => {
                    formik.setFieldValue("file", event.currentTarget.files[0])
                  }}
                />
                <FormHelperText>
                  A default audio file will be sent if you do not select any
                </FormHelperText>
              </FormControl>

              <Button type='submit' mt='10' w='100%' colorScheme='green' isLoading={loading}>Submit</Button>
            
            </form>
          </Box>


          {
            response && <Box mt='20' w='80%'>
              <ReactPlayer
                url={playerURL}
                controls={true}
                playing={false}
                width="100%"
                height="50px"
              />
              <Text mt='10' mb='20' fontSize='xl'>{response}</Text>
            </Box>
          }


        </VStack>
      </Center>
    </ChakraProvider>
  )
}



export default App;
