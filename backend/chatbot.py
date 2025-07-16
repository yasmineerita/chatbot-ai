import os
from dotenv import load_dotenv, find_dotenv

from langchain_community.llms import LlamaCpp
from langchain_core.callbacks import CallbackManager, StreamingStdOutCallbackHandler
from langchain_core.prompts import PromptTemplate

env_file = find_dotenv('.env.' + os.environ['var'])
load_dotenv(env_file)

MODEL_PATH = os.path.join(os.getcwd() + os.getenv("MODEL_PATH"))

# llm = LlamaCPP(
#     # You can pass in the URL to a GGML model to download it automatically
#     # model_url=MODEL_PATH,
#     # optionally, you can set the path to a pre-downloaded model instead of model_url
#     model_path=MODEL_PATH,
#     temperature=0.1,
#     max_new_tokens=256,
#     # llama2 has a context window of 4096 tokens, but we set it lower to allow for some wiggle room
#     context_window=3900,
#     # kwargs to pass to __call__()
#     generate_kwargs={},
#     # kwargs to pass to __init__()
#     # set to at least 1 to use GPU
#     model_kwargs={"n_gpu_layers": 1},
#     # transform inputs into Llama2 format
#     messages_to_prompt=messages_to_prompt,
#     completion_to_prompt=completion_to_prompt,
#     verbose=False,
# )

template = """Question: {question}

Please provide the correct answer to the question. If the question requires a detailed explanation or multiple steps (e.g., math problems, process-oriented questions), provide the answer in a step-by-step format. If the question can be answered directly, give a concise response without steps.
"""

prompt = PromptTemplate.from_template(template)

# Callbacks support token-wise streaming
callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])

llm = LlamaCpp(
    model_path=MODEL_PATH,
    temperature=0.75,
    max_tokens=2000,
    top_p=1,
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)

# print("Response text: \n", response.text)

def generate_response(message: str):
  message = message.lower()
  print("user query:", message)

  if "hello" in message:
    return "Hello there! How can I help you?"
  elif "how are you" in message:
    return "I'm doing well. Thanks for asking."
  elif "your name" in message:
    return "My name is Yasmineerita."
  elif "bye" in message or "exit" in message:
    return "Baibai~!!~ See you next time."
  else:
    formatted_prompt = prompt.format(question=message)
    return llm.invoke(formatted_prompt)
