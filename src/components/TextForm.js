import React, { useState } from "react";

export default function TextForm(props) {
  const [text, setText] = useState("");

  const handleOnChange = (event) => {
    setText(event.target.value);
  };

  const handleUpClick = () => {
    let newText = text.toUpperCase();
    setText(newText);
    props.showAlert("Converted to uppercase!", "success");
  };

  const handleLwClick = () => {
    let newText = text.toLowerCase();
    setText(newText);
    props.showAlert("Converted to lowercase!", "success");
  };

  const handleClClick = () => {
    let newText = "";
    setText(newText);
    props.showAlert("Text cleared!", "success");
  };

  const handleCptxtClick = () => {
    let words = text.split(" ");
    const capitalizedWords = words.map((word) => {
      // Capitalize the first character and convert the rest to lowercase
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    let newText = capitalizedWords.join(" ");

    setText(newText);
    props.showAlert("Converted to capitalized text!", "success");
  };

  const handleDownloadtxtClick = () => {
    const filename = "example.txt";
    let blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    // console.log(url);
    const link = document.createElement("a");
    // Set link's href attribute to the temporary URL
    link.href = url;

    // Set link's download attribute to the filename
    link.download = filename;

    // Append the link to the body
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up: remove the link and revoke the temporary URL
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log(url);
    props.showAlert("File Download Sucessfully!", "success");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    props.showAlert("Text Copied!", "success");
  };

  const handleExtraSpaces = () => {
    let newText = text.split(/[ ]+/);
    setText(newText.join(" "));
    props.showAlert("Extra space removed!", "success");
  };

  const handleSummarizeClick = async () => {
    if (!text.trim()) return;

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );

      const data = await response.json();

      if (data.error) {
        console.error("Hugging Face API Error:", data.error);
        alert("Summarization failed: " + data.error);
        return;
      }

      if (data[0]?.summary_text) {
        setText(data[0].summary_text);
        props.showAlert("Summarized successfully!", "success");
      } else {
        alert("No summary returned.");
      }
    } catch (error) {
      console.error("Summarization error:", error);
      alert("Something went wrong. Check console.");
    }
  };

  const handleGrammarCheck = async () => {
    if (text.trim() === "") {
      props.showAlert("Please enter some text.", "warning");
      return;
    }

    try {
      const response = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          text: text,
          language: "en-US",
        }),
      });

      const data = await response.json();

      if (data.matches.length === 0) {
        props.showAlert("No grammatical issues found!", "success");
      } else {
        const suggestions = data.matches
          .map(
            (match) =>
              `${match.message} → "${
                match.replacements[0]?.value || "no suggestion"
              }"`
          )
          .join("\n");

        alert("Grammar Suggestions:\n\n" + suggestions);
        props.showAlert("Grammar check complete!", "info");
      }
    } catch (error) {
      console.error("Grammar check failed:", error);
      props.showAlert("Grammar check failed. Try again later.", "danger");
    }
  };

  const [entities, setEntities] = useState([]);
  const handleNER = async () => {
    if (!text.trim()) return;

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/dbmdz/bert-large-cased-finetuned-conll03-english",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );

      const data = await response.json();

      if (data.error) {
        console.error("NER API Error:", data.error);
        alert("NER request failed: " + data.error);
        return;
      }

      // data will be an array of entities
      setEntities(data);
    } catch (error) {
      console.error("NER Error:", error);
      alert("Something went wrong with NER.");
    }
  };

  return (
    <>
      <div>
        <h1 style={{ color: props.mode === "light" ? "black" : "white" }}>
          {" "}
          {props.heading}{" "}
        </h1>
        <div className="mb-3">
          <textarea
            style={{
              backgroundColor: props.mode === "light" ? "white" : "black",
              color: props.mode === "light" ? "black" : "white",
            }}
            className="form-control border border-dark"
            value={text}
            onChange={handleOnChange}
            id="myBox"
            rows="8"
          ></textarea>

          <button
            disabled={text.length === 0}
            className={`btn my-3 btn-outline-${
              props.mode === "light" ? "dark" : "light"
            } btn-sm`}
            onClick={handleUpClick}
          >
            Change to UpperCase
          </button>

          <button
            disabled={text.length === 0}
            className={`btn my-3 mx-2 btn-outline-${
              props.mode === "light" ? "dark" : "light"
            } btn-sm`}
            onClick={handleLwClick}
          >
            Change to LowerCase
          </button>

          <button
            disabled={text.length === 0}
            className={`btn my-3 btn-outline-${
              props.mode === "light" ? "dark" : "light"
            } btn-sm`}
            id="cleartxt"
            onClick={handleClClick}
          >
            Clear text
          </button>

          <button
            disabled={text.length === 0}
            className={`btn my-3 mx-2 btn-outline-${
              props.mode === "light" ? "dark" : "light"
            } btn-sm`}
            onClick={handleCptxtClick}
          >
            Capitalized text
          </button>

          <button
            disabled={text.length === 0}
            className={`btn my-3 btn-outline-${
              props.mode === "light" ? "dark" : "light"
            } btn-sm`}
            onClick={handleDownloadtxtClick}
          >
            Download text
          </button>

          <button
            disabled={text.length === 0}
            className={`btn my-3 mx-1   btn-outline-${
              props.mode === "light" ? "dark" : "light"
            } btn-sm`}
            onClick={handleCopy}
          >
            Copy
          </button>

          <button
            disabled={text.length === 0}
            className={`btn my-3 btn-outline-${
              props.mode === "light" ? "dark" : "light"
            } btn-sm`}
            onClick={handleExtraSpaces}
          >
            Remove Extra Spaces
          </button>
          <button
            disabled={text.length === 0}
            className={`btn my-3  mx-2 btn-outline-${
              props.mode === "light" ? "dark" : "light"
            } btn-sm`}
            onClick={handleSummarizeClick}
          >
            Summarize with AI
          </button>
          <button
            disabled={text.length === 0}
            className={`btn my-3 btn-outline-${
              props.mode === "light" ? "dark" : "light"
            } btn-sm`}
            onClick={handleGrammarCheck}
          >
            Grammar Checker
          </button>
          <button
            disabled={text.length === 0}
            className={`btn my-3 mx-2 btn-outline-${
              props.mode === "light" ? "dark" : "light"
            } btn-sm`}
            onClick={handleNER}
          >
            Extract Named Entities
          </button>
        </div>
      </div>

      <div
        className="container"
        style={{ color: props.mode === "light" ? "black" : "white" }}
      >
        <h2>Your text summary</h2>
        <p>
          {
            text
              .trim()
              .split(/\s+/)
              .filter((word) => word !== "").length
          }{" "}
          words and {text.length} characters
        </p>
        <p>
          {0.008 *
            text
              .trim()
              .split(/\s+/)
              .filter((word) => word !== "").length}{" "}
          Minutes read
        </p>
        <h2>Preview</h2>
        <p>{text.length > 0 ? text : "Nothing to preview!"}</p>

        {/* Named Entity Recognition Results */}
        <div style={{ color: props.mode === "light" ? "black" : "white" }}>
          <h2>Named Entities</h2>
          {entities.length === 0 ? (
            <p>No entities found</p>
          ) : (
            <>  
              {["ORG", "PER", "LOC", "MISC"].map((type) => {
                // Filter unique entities of this type
                const filteredEntities = entities
                  .filter((e) => e.entity_group === type)
                  .map((e) => e.word);
                const uniqueEntities = [...new Set(filteredEntities)];

                if (uniqueEntities.length === 0) return null;

                // Map entity type to readable name
                const typeNames = {
                  ORG: "Organizations",
                  PER: "People",
                  LOC: "Locations",
                  MISC: "Miscellaneous",
                };

                return (
                  <div key={type} style={{ marginBottom: "1rem" }}>
                    <h3>{typeNames[type]}</h3>
                    <ul>
                      {uniqueEntities.map((entity, index) => (
                        <li key={index}>{entity}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}
