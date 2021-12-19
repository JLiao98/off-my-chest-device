var textarea, button;

function setup() {
  noCanvas();

  textarea = select("textarea");
  button = select("button")
  button.mousePressed(buttonClicked);
}

function buttonClicked() {
  nlu(textarea.value(), nluComplete);
}

function nluComplete(response) {
  // Print complete response
  print(response);

  // ==== SENTIMENT ANALYSIS ====
  createElement("h2", "Sentiment analysis");
  var sentiment = response.result.sentiment.document;
  print(sentiment);
  createSpan("Positiveness: ");
  var positiveness = createElement("progress");
  positiveness.value(map(sentiment.score, -1, 1, 0, 1));
  createSpan(round(sentiment.score * 100) + "%");

  if (sentiment.label == "positive")
    createSpan("😊");
  else if (sentiment.label == "neutral")
    createSpan("😐");
  else
    createSpan("🙁");


  // ==== CATEGORIES ANALYSIS ====
  var categories = response.result.categories;
  print(categories);
  createElement("h2", "Categories");

  createP("This speech is about: <b>" + categories[0].label + "</b>");

  
  // ==== EMOTION ANALYSIS ====
  if (response.result.emotion) { // only with English texts
    var emotion = response.result.emotion.document.emotion;
    print(emotion);

    createElement("h2", "Emotion analysis");
    createSpan("Anger");
    var progressAnger = createElement("progress");
    progressAnger.value(emotion.anger);
    createSpan(round(emotion.anger * 100) + "%");
  }
}