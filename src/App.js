
import {
  ChakraProvider,
  Center, VStack, Heading, Box,
  FormControl, FormLabel, Input,
  FormHelperText, Link, Button,
  FormErrorMessage
} from "@chakra-ui/react";

import { useState, useEffect } from "react";
import { object, string } from 'yup';
import { useFormik } from 'formik';



function App() {

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(false);


  const gladiaAPI = new RegExp('^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$');


  const formik = useFormik({
    initialValues: {
      key: '',
      file: ''
    },
    onSubmit: async values => {
      const data = new FormData()
          , api = 'https://api.gladia.io/v2'
          ;
      data.append("audio", values.file);
      setLoading(true);
      try {


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
      } catch (error) {
        setResponse(error);
        setLoading(false)
      }
    },
    validationSchema: object({
      key: string().matches(gladiaAPI, "Does not match the Gladia format").required("Required")
    })
  });



  useEffect(() => {
    response && console.log(response)
  }, [response]);



  return (
    <ChakraProvider>
      <Center>
        <VStack>
          <Heading as='h1' size='xl' mt='20'>Speech-to-Text API</Heading>
          <form onSubmit={formik.handleSubmit}>
            <Box w="320">


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
              </FormControl>


              <Button type='submit' mt='10' w='100%' colorScheme='green' isLoading={loading}>Submit</Button>


            </Box>
          </form>
        </VStack>
      </Center>
    </ChakraProvider>
  )
}



export default App;
