
# Gladia Home Assignement 

<br />

## Instructions

I have reported the instructions provided in [Instructions.md](https://github.com/j5py/gladia-home-assignment/blob/main/Instructions.md).

<br />

## Results

### Task 1: Technical Understanding and API Integration

<br />

#### API Integration

> No need to know React, just run the app and browse!

<br />

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
        "Extract the key points from the transcription as bullet points"
      ]
    },
    "audio_url": "<your_url_received_after_last_upload>"
  }'
```

| JSON dataset          | Comment                                                                           |
|-----------------------|-----------------------------------------------------------------------------------|
| `audio_to_llm`        | This parameter allows the subsequent configuration point to be taken into account |
| `audio_to_llm_config` | Edit the content of the `prompts` list (or array) as comma-separated strings      |

Remember to edit the placeholders, but retain the double quotes in the --data option to ensure it matches the JSON format. Check **cURL** description of [Create Transcription](https://docs.gladia.io/api-reference/api-v2/Transcription/post-v2transcription) to see an example of a custom prompt request, and [Audio to LLM](https://docs.gladia.io/chapters/audio-intelligence/pages/audio%20to%20llm) for several prompts in a single request. Finally, this time it's the value of `result_url` that you need to note from the response. 

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

> Note that this command will only filter the first occurrence of *response* corresponding to the first prompt. Subsequent occurrences will be ignored if your previous request contained more than one prompt (in this case, you might consider [jq](https://jqlang.github.io/jq/)).

<br />

| Snippet                           | Description                                                       |
|-----------------------------------|-------------------------------------------------------------------|
| \\                                | Allows you to split a long command across multiple lines          |
| \|                                | Pipes output to the next command                                  |
| grep -o '"response":"[^"]*' \|    | captures everything from "response":" up to the next double quote |
| grep -o '[^:]*$' \|               | Captures the content after the last colon                         |
| tr -d '"'                         | Removes double quotes from the output                             |

<br />

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

> Knowing that the access can be read with `<receivedObject>.result.audio_to_llm.results[0].results.response` in JavaScript helps us understand that the value we are looking for is part of a much larger structure, which is why it can be tedious to find using the raw result of curl. In the case where your previous request contained more than one prompt, you will need to iterate through the results in this way, for example: `<receivedObject>.result.audio_to_llm.results.forEach(<item> => ...`

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
<br />

##### Ticket 4

*"Do you support Chinese?"*

###### Re:

Good Day,

Thanks for reaching out! I'm here to help you with any questions you may have.

Absolutely! Chinese, identified by the ISO 639 language code `zh`, is one of the available options under [Create Transcription](https://docs.gladia.io/api-reference/api-v2/Transcription/post-v2transcription)  > **Body** > `language` and is also one of the possible values of `target_languages` in the examples accessible through [Translation](https://docs.gladia.io/chapters/audio-intelligence/pages/translation) > **Sample code**.

Please let me know if you are making progress. I am available to assist you if you encounter any difficulties. You may also refer to the [complete list of supported languages](https://docs.gladia.io/chapters/speech-to-text-api/pages/languages) for any future needs.

<br />

Kind regards

<br />
<br />

##### Ticket 5

*"We received complaints from our customers about some very inaccurate transcriptions yesterday, can you check what happened?"*

###### Re:

Good Day,

I appreciate you getting in touch. Let's work together to resolve your concern.

Could you please specify which functionality of Gladia or API key is the subject of the inaccurate transcriptions, and could you provide us with any records of the requests and responses?

<br />

Here are some ways to fine-tune the configuration by functionality to prevent inaccuracy:

- **Speech Recognition**
  - [Multiple languages detection ](https://docs.gladia.io/chapters/speech-to-text-api/pages/speech-recognition#multiple-languages-detection-code-switching): Is not activated by default and allows switching the transcription language, but strong accents may cause misinterpretation.
  - [Custom vocabulary](https://docs.gladia.io/chapters/speech-to-text-api/pages/speech-recognition#custom-vocabulary) and [Custom spelling](https://docs.gladia.io/chapters/speech-to-text-api/pages/speech-recognition#custom-spelling) can significantly enhance the accuracy of transcriptions in specific contexts, such as professional environments where the use of acronyms and internal expressions is commonplace.

- **Live Speech Recognition**
  - [Recovering from WebSocket disconnects](https://docs.gladia.io/chapters/speech-to-text-api/pages/live-speech-recognition#recovering-from-websocket-disconnects) could help prevent missing parts that would cause the transcription to appear erroneous.
  - [Chunk Size Limitation](https://docs.gladia.io/chapters/speech-to-text-api/pages/live-speech-recognition#chunk-size-limitation) and [Thirty Seconds Behavior](https://docs.gladia.io/chapters/speech-to-text-api/pages/live-speech-recognition#thirty-seconds-behavior) should also be considered to ensure the complete input/output is captured.
- **Speaker Diarization**
  - [Speaker diarization](https://docs.gladia.io/chapters/speech-to-text-api/pages/speaker-diarization) may also improve accuracy by determining the identity of each speaker and attributing their statements accordingly.

<br />

If it is complex for you to specify the context of the feedback observed, we could schedule a meeting to identify it at your convenience.


<br />

Kind regards

<br />
<br />

### Task 3: Technical Documentation and Communication

#### Documentation Review

<br />

##### Audio to LLM

Harness **the power of the LLM command prompt** to access a range of processing capabilities **beyond transcription**, all in a single request. In addition to speech-to-text, you will fully leverage the value of its content. Ask any question or analysis, as you would do with an assistant.

You only need to write the different treatments you wish to apply to the transcription, with the prompts listed as comma-separated values in the `prompts` list (or array). In addition to the complete transcription, you will obtain a list of results: each will contain the prompt sent to the LLM and its associated output.

<br />

The **Audio to LLM** feature applies your own prompts to the audio transcription.

```Python
import requests
import time


def make_fetch_request(url, headers, method='GET', data=None):
    if method == 'POST':
        response = requests.post(url, headers=headers, json=data)
    else:
        response = requests.get(url, headers=headers)
    return response.json()


gladia_key = "YOUR_GLADIA_API_TOKEN"
request_data = {
  "audio_url": "YOUR_AUDIO_URL",
  "audio_to_llm": True,
  "audio_to_llm_config": {
    "prompts": [
      "Extract the key points from the transcription as bullet points",
      "Generate a title from this transcription"
    ]
  }
}
gladia_url = "https://api.gladia.io/v2/transcription/"

headers = {
    "x-gladia-key": gladia_key,
    "Content-Type": "application/json"
}

print("- Sending initial request to Gladia API...")
initial_response = make_fetch_request(
    gladia_url, headers, 'POST', request_data)

print("Initial response with Transcription ID:", initial_response)
result_url = initial_response.get("result_url")

if result_url:
    while True:
        print("Polling for results...")
        poll_response = make_fetch_request(result_url, headers)

        if poll_response.get("status") == "done":
            print("- Transcription done: \n")
            audio_to_llm_results = poll_response.get("result", {}).get(
                "audio_to_llm", {})
            print(audio_to_llm_results)
            break
        else:
            print("Transcription status:", poll_response.get("status"))
        time.sleep(1)

```

With this code, your output will look like this:

```JSON
{
  "success": true,
  "is_empty": false,
  "results": [
    {
      "success": true,
      "is_empty": false,
      "results": {
        "prompt": "Extract the key points from the transcription as bullet points",
        "response": "The main entities key points from the transcription are:\n- ..."
      },
      "exec_time": 1.7726809978485107,
      "error": null
    },
    {
      "success": true,
      "is_empty": false,
      "results": {
        "prompt": "Generate a title from this transcription",
        "response": "The Great Title"
      },
      "exec_time": 1.7832809978258485,
      "error": null
    }
  ],
  "exec_time": 6.127103805541992,
  "error": null
}
```

You’ll find your custom prompts results of your audio under the results key.

<br />
<br />
