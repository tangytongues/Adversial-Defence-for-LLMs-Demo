from flask import Flask, request, jsonify
from transformers import pipeline
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)

try:
    classifier = pipeline("text-classification", model="unitary/toxic-bert")
except Exception as e:
    print("Model loading failed:", str(e))
    traceback.print_exc()

@app.route('/classify', methods=['POST'])
def classify_prompt():
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')

        if not prompt.strip():
            return jsonify({'label': 'harmful', 'score': 1.0, 'error': 'Empty prompt'}), 400

        result = classifier(prompt)[0]
        label = result['label'].lower()
        score = result['score']

        if label == "toxic" and score > 0.5:
            return jsonify({'label': 'harmful', 'score': score})
        else:
            return jsonify({'label': 'harmless', 'score': score})

    except Exception as e:
        print("Error during classification:", str(e))
        traceback.print_exc()
        return jsonify({'label': 'error', 'score': 0.0, 'message': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)
