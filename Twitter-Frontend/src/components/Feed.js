import React, { useState, useEffect, useContext } from "react";
import Tweet from "./Tweet";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import "reactjs-popup/dist/index.css";
import { urlContext } from "../index";

function Feed() {
  const [input, setInput] = useState("");
  // const [imageInput, setImageInput] = useState();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const navigate = useNavigate();
  const [img, setImg] = useState("");
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [tweetCount, setTweetCount] = useState("20");
  const url = useContext(urlContext);

  const checkInput = input || img;

  async function populateTweets() {
    const req = await fetch(
      `${url}/feed`,
      {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      },
      {
        mode: "cors",
      }
    );

    const data = await req.json();
    if (data.status === "ok") {
      setTweets(data.tweets);
      setActiveUser(data.activeUser.username);
      setUserAvatar(data.activeUser.avatar);
      setLoading(false);
    } else {
      alert(data.error);
      navigate("/");
    }
  }

  async function addTweets(e) {
    e.preventDefault();
    const req = await fetch(`${url}/feed?t=${tweetCount}`, {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });

    const data = await req.json();
    if (data.status === "ok") {
      setTweets((prevTweets) => {
        return [...prevTweets, ...data.tweets];
      });
      setTweetCount((prevValue) => {
        return parseInt(prevValue) + 20;
      });
    } else {
      alert(data.error);
      navigate("/");
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = jwtDecode(token);
      if (!user) {
        localStorage.removeItem("token");
      } else {
        populateTweets();
      }
    } else navigate("/");
  }, [loading]);

  return (
    <div>
      <div className="tweets">
        <ul className="tweet-list">
          {loading ? (
            <div
              style={{ marginTop: "50px", marginLeft: "250px" }}
              class="loadingio-spinner-rolling-uzhdebhewyj"
            >
              <div class="ldio-gkgg43sozzi">
                <div></div>
              </div>
            </div>
          ) : (
            tweets.map(function (tweet) {
              return (
                <>
                  <Tweet
                    updateLoading={setLoading}
                    user={activeUser}
                    body={tweet}
                  />
                </>
              );
            })
          )}
        </ul>
      </div>
      <form className="showMore-form" onSubmit={addTweets}>
        <button className="showMore" type="submit">
          Show more tweets
        </button>
      </form>
    </div>
  );
}

export default Feed;
