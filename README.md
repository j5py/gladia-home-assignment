
# Gladia Home Assignement 

<br />

## Instructions

I have reported the instructions provided in [Instructions.md](https://github.com/j5py/gladia-home-assignment/blob/main/Instructions.md).

<br />

## Results

### Task 1: Technical Understanding and API Integration

<br />

#### API Integration

1. Load the React app locally

    ```
    git clone git@github.com:j5py/gladia-home-assignment.git
    ```

2. Install the app

    ```
    cd gladia-home-assignment; npm install
    ```

3. Run the app

    ```
    npm start
    ```

4. Interact with the app that should now have automatically opened on [localhost:3000](http://localhost:3000/)

5. Review the [code written to implement the API](https://github.com/j5py/gladia-home-assignment/blob/main/src/App.js)

<br />
<br />

#### Technical Write-Up

##### How to Generate a Bullet Point Summary of an Audio File

The following Shell commands can be executed from a Unix/Linux terminal. The syntax may need to be adapted for Command Prompt, for example, on Windows OS. However, you can use Git Bash (especially from a Visual Studio Code terminal). Using curl and a terminal facilitates testing, the documentation also provides examples in Python, JavaScript, PHP, Go, and Java.

<br />

###### Quick Overview of the Necessary Steps

1. Upload the file to Gladia and get its URL in return
2. Request Gladia to proceed with the transcription of the file at the given URL
3. A new URL allows you to obtain a dataset, including the text of the transcription

<br />

###### Upload Your File to Gladia

```
curl --request POST \
  --url https://api.gladia.io/v2/upload \
  --header 'Content-Type: multipart/form-data' \
  --header 'x-gladia-key: <your_gladia_api_key>' \
  --form audio=@<your_audio_file>
```

| Placeholder           | Example       | Comment                                                                                                       |
|-----------------------|---------------|---------------------------------------------------------------------------------------------------------------|
| <your_gladia_api_key> |               | Get a key in less than a minute and for free after [creating your account](https://app.gladia.io/auth/signup) |
| <your_audio_file>     | ./audio.wav   | In case the audio file is in the current directory from which you run curl                                    |

After a short delay for the request to be processed, you will receive a **JSON dataset**, and one key particularly interests us here: `audio_url`. Note the corresponding value for the next step.

<br />

###### Request Gladia to Process the Transcription of the Uploaded File

```
curl --request POST \
  --url https://api.gladia.io/v2/transcription \
  --header 'Content-Type: application/json' \
  --header 'x-gladia-key: <your_gladia_api_key>' \
  --data '{
    "audio_to_llm": true,
    "audio_to_llm_config": {
      "prompts": [
        "Extract the key points from the transcription"
      ]
    },
    "audio_url": "<your_url_received_after_last_upload>"
  }'
```

| Request parameter     | Comment                                                                                                                                       |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| audio_to_llm          | This parameter allows the subsequent configuration point to be taken into account                                                             |
| audio_to_llm_config   | Prompt (see **cURL** description of [Create Transcription](https://docs.gladia.io/api-reference/api-v2/Transcription/post-v2transcription))   |

Remember to edit the placeholders, but retain the double quotes in the --data option to ensure it matches the JSON format. This time, it is the value of `result_url` that you need to note.

<br />

###### Check that the Requested Transcription is Available

```
curl --request GET \
  --url <your_result_url> \
  --header 'x-gladia-key: <your_gladia_api_key>'
```

Note that the value of the key `status` may initially return `queued` or `processing`.  In those case, you will need to repeat the request until you obtain `done` in a JSON dataset that may vary in size depending on the length of the uploaded audio.

<br />

###### Filter the Dataset to Obtain the Summary

First, let's continue with curl to complete the process. This request is identical to the previous one, but it allows for filtering of a potentially large result.

```
curl --request GET \
  --url <your_result_url> \
  --header 'x-gladia-key: <your_gladia_api_key>' | \
  grep -o '"response":"[^"]*' | \
  grep -o '[^:]*$' | \
  tr -d '"'
```

| Snippet                           | Description                                                       |
|-----------------------------------|-------------------------------------------------------------------|
| \\                                | Allows you to split a long command across multiple lines          |
| \|                                | Pipes output to the next command                                  |
| grep -o '"response":"[^"]*' \|    | captures everything from "response":" up to the next double quote |
| grep -o '[^:]*$' \|               | Captures the content after the last colon                         |
| tr -d '"'                         | Removes double quotes from the output                             |


Now with JavaScript, you can also request the same URL as in the previous curl command to achieve a more immediate reading of the response access. You can [open Chrome DevTools](https://developer.chrome.com/docs/devtools/open?hl=en) and paste your edited version of the code below to [execute it from your browser's console](https://developer.chrome.com/docs/devtools/console/javascript?hl=en).

```JavaScript
fetch('<your_result_url>', {
    method: 'GET',
    headers: { 'x-gladia-key': '<your_gladia_api_key>' }
}).then(
    jsonString => jsonString.json()
).then(
    jsObject => console.log(jsObject.result.audio_to_llm.results[0].results.response)
)
```

> Knowing that the access can be read with `<receivedObject>.result.audio_to_llm.results[0].results.response` in JavaScript helps us understand that the value we are looking for is part of a much larger structure, which is why it can be tedious to find using the raw result of curl.

<br />
<br />
