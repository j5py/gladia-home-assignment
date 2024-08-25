
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

### Task 2: Customer Support Simulation

#### Mock Tickets

<br />

##### Ticket 1

*"I keep getting a 401 Unauthorized error when trying to access the API."*

###### Re:

Good Day,

Thank you for your message. I'm glad to assist you with this matter.

I would first recommend checking if the `x-gladia-key` value used in your request exists and fully matches one of the **API keys** listed on [your Account page](https://app.gladia.io/account). A simple visual check can help spot if the key is altered, but it's good practice to use the 'copy to clipboard' feature and paste the key into your request code to ensure you have the correct value.

Please let me know if this allows you to solve the issue. If you continue to receive the 401 status code, I will first need you to provide me with a few details about your technical environment, such as the code snippet of the request and/or a screenshot of your test.

<br />

Kind regards

<br />

##### Ticket 2

*"I receive an error when trying some of my files: 413 file too large. Why is that and what can I do?"*

###### Re:

Good Day,

Thank you for contacting support. I'm here to help you with your issue.

This is the expected behavior of the Gladia API for performance reasons. Currently, the API has [limitations](https://docs.gladia.io/chapters/limits-and-specifications/pages/supported-formats#gladia-api-current-limitations) of **135 minutes** and **500 MB** in size, but we provide you with a few [tools for splitting audio files](https://docs.gladia.io/chapters/limits-and-specifications/pages/supported-formats#splitting-oversize-audio-files). You need to initiate the setup of one of these tools based on your environment. Please do not hesitate to confirm when it is resolved, or reach out if you encounter any issues with the configuration.

<br />

Kind regards

<br />

##### Ticket 3

*"I'm seeing a significant delay in receiving the transcription results. Is there a way to speed this up?"*

###### Re:

Good Day,

Thank you for reaching out to us. We appreciate your inquiry.

We can provide **high concurrency** based on your needs. If you are experiencing a significant delay in receiving results, it is likely due to handling high volumes of requests that exceed the [default values](https://docs.gladia.io/chapters/limits-and-specifications/pages/concurrency). We can offer you additional computational capacity to manage a large number of requests or operations simultaneously.

Could you please share your availability for a meeting to discuss your usage requirements and evaluate the solution?

<br />

Kind regards

<br />

##### Ticket 4

*"Do you support Chinese?"*

###### Re:

Good Day,

Thanks for reaching out! I'm here to help you with any questions you may have.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.

<br />

Kind regards

<br />

##### Ticket 5

*"We received complaints from our customers about some very inaccurate transcriptions yesterday, can you check what happened?"*

###### Re:

Good Day,

I appreciate you getting in touch. Let's work together to resolve your concern.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.

<br />

Kind regards

<br />
<br />
