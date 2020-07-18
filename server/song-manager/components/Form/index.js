import Link from "next/link";

import { useState, useEffect } from "react";

import styles from "./form.module.scss";
import { DDR_VERSIONS, TITLE_CATEGORIES } from "../../data/constants";
import { getDisplayBpmFromSm, getEagateData, getSmFromUrl, getFileName, getSongPosition } from "../../clientUtils";
// import "./form.module.scss";

export default function Form(props) {
  const { song, jacket, isNew } = props;

  const [form, setForm] = useState(song);
  const [sm, setSm] = useState(null);
  const [smName, setSmName] = useState(song.smName);

  const [retrievingData, setRetrievingData] = useState(false);

  const [songInputType, setSongInputType] = useState("id");
  const [smInputType, setSmInputType] = useState("url");

  useEffect(() => {
    const [bSP, BSP, DSP, ESP, CSP, BDP, DDP, EDP, CDP] = song.levels.split(",");

    const initForm = { ...form, bSP, BSP, DSP, ESP, CSP, BDP, DDP, EDP, CDP };

    setForm(initForm);
  }, []);

  const updateFields = (newFields) => {
    setForm({ ...form, ...newFields });
  };

  const handleFileUpload = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];

    console.log(file);

    const smName = file.name.replace(/\.sm$/, "").replace(/\.ssc$/, "");
    setSmName(smName);

    fileReader.onload = function (fileLoadedEvent) {
      setSm(fileLoadedEvent.target.result);
    };
    fileReader.readAsText(file, "UTF-8");

    // console.log(file);
  };

  const fillAutomaticFields = async () => {
    let fieldsToUpdate = {};

    setRetrievingData(true);

    // if "Title" has been filled out under manual entry fields,
    // the form will scrape eagate to find the song that matches this title
    // (case and whitespace insensitive)
    if (form.titleForSearch) {
      const json = await getSongPosition({ title: form.titleForSearch });
      fieldsToUpdate = { ...fieldsToUpdate, ...json, hash: json.songId };
      fieldsToUpdate.titleForSearch = json.songTitle;
      fieldsToUpdate.title = json.songTitle;
    }

    let smData, smNameData;

    if (smName) {
      smNameData = smName;
    }
    if (smInputType === "file" && sm) {
      smData = sm;
    } else if (smInputType === "url" && form.smUrl) {
      try {
        smData = await getSmFromUrl(form.smUrl);
        setSm(smData);
        smNameData = getFileName(form.smUrl);
        console.log(smNameData);
        setSmName(smNameData);
      } catch (err) {}
    }
    if (smData) {
      const displayBpm = getDisplayBpmFromSm(smData);
      fieldsToUpdate.displayBpm = displayBpm;
    }

    if (smNameData) {
      fieldsToUpdate.smName = smNameData;
    }

    if (form.hash || fieldsToUpdate.hash) {
      let hash = fieldsToUpdate.hash || form.hash;
      try {
        const res = await getEagateData(hash);
        let { title, artist, difficulties } = res;
        fieldsToUpdate.title = title;
        fieldsToUpdate.artist = artist;
        const difficultyMap = ["bSP", "BSP", "DSP", "ESP", "CSP", "BDP", "DDP", "EDP", "CDP"];
        difficulties.forEach((difficulty, idx) => {
          fieldsToUpdate[difficultyMap[idx]] = difficulty;
        });
      } catch (err) {}
    }

    if (form.dAudioUrl) {
      const dAudioUrl = form.dAudioUrl.replace(`https://www.dropbox.com/s/`, "").replace("?dl=0", "");
      fieldsToUpdate.dAudioUrl = dAudioUrl;
    }

    console.log("fieldsToUpdate", fieldsToUpdate);

    setRetrievingData(false);

    updateFields(fieldsToUpdate);
  };

  return (
    <div className={styles.container}>
      <form className={styles.formContainer}>
        <h2>{isNew ? "Add" : "Edit"} song</h2>

        <section className={styles.manualEntryFields}>
          <h3>Manual entry fields</h3>
          <div className={styles.formField}>
            {songInputType === "id" && (
              <>
                <label>ID: </label>
                <input
                  value={form.hash}
                  onChange={(e) => {
                    updateFields({ hash: e.target.value });
                  }}
                  placeholder='e.g. "8bQQ0lP96186D8Ibo8IoOd6o16qioiIo"'
                />
                <button type="button" className="link-btn" onClick={() => setSongInputType("title")}>
                  Use song title
                </button>
              </>
            )}
            {songInputType === "title" && (
              <>
                <label>Title: </label>
                <input
                  value={form.titleForSearch}
                  onChange={(e) => {
                    updateFields({ titleForSearch: e.target.value });
                  }}
                  placeholder="All characters must match exactly with the official in-game title!"
                />
                <button type="button" className="link-btn" onClick={() => setSongInputType("id")}>
                  Use song ID
                </button>
              </>
            )}
          </div>
          <div className={styles.formField}>
            {smInputType === "url" && (
              <>
                <label>SM URL: </label>
                <input
                  value={form.smUrl}
                  onChange={(e) => {
                    updateFields({ smUrl: e.target.value });
                  }}
                />
                <button type="button" className="link-btn" onClick={() => setSmInputType("file")}>
                  Upload file
                </button>
              </>
            )}
            {smInputType === "file" && (
              <>
                <label>SM File: </label>
                <input type="file" onChange={handleFileUpload} />
                <button type="button" className="link-btn" onClick={() => setSmInputType("url")}>
                  Use direct URL
                </button>
              </>
            )}
          </div>
          <div className={styles.formField}>
            <label>Audio URL: </label>
            <input value={form.dAudioUrl} onChange={(e) => updateFields({ dAudioUrl: e.target.value })} />
          </div>
          <div className={styles.formField}>
            <label>Version: </label>
            <select value={form.version} onChange={(e) => updateFields({ version: e.target.value })}>
              <option value="" disabled>
                Choose version
              </option>
              {DDR_VERSIONS.map((version, idx) => {
                return (
                  <option key={`version_${idx}`} value={idx}>
                    {version}
                  </option>
                );
              })}
            </select>
          </div>

          <button type="button" onClick={fillAutomaticFields}>
            Fill automatic fields
          </button>
        </section>

        {retrievingData ? <p>Retrieving data, please wait... (check terminal logs for progress information)</p> : null}

        <section className={styles.automaticEntryFields}>
          <h3>Automatic entry fields</h3>
          {!isNew && (
            <div className={styles.formField}>
              <label>Index: </label>
              <span>{form.index}</span>
            </div>
          )}

          <div className={styles.formField}>
            <label>Title: </label>
            <input
              value={form.title}
              onChange={(e) => {
                updateFields({ title: e.target.value });
              }}
            />
          </div>
          {!isNew && jacket && (
            <div className={styles.formField}>
              <label>Jacket preview:</label>
              <img src={`data:image/png;base64,${jacket}`} alt={form.title} className={styles.jacketPreview} />
            </div>
          )}
          {isNew && form.hash && form.hash.length === 32 && (
            <div className={styles.formField}>
              <label>Jacket preview:</label>

              <img
                src={`https://p.eagate.573.jp/game/ddr/ddra20/p/images/binary_jk.html?img=${form.hash}&kind=1`}
                alt={form.title}
                className={styles.jacketPreview}
              />
            </div>
          )}
          <div className={styles.formField}>
            <label>smName: </label>
            <input
              value={form.smName}
              onChange={(e) => {
                updateFields({ smName: e.target.value });
              }}
            />
          </div>

          <div className={styles.formField}>
            <label>Artist: </label>
            <input
              value={form.artist}
              onChange={(e) => {
                updateFields({ artist: e.target.value });
              }}
            />
          </div>

          <div className={styles.formField}>
            <label>Display BPM: </label>
            <input
              value={form.displayBpm}
              onChange={(e) => {
                updateFields({ displayBpm: e.target.value });
              }}
            />
          </div>

          <div className={styles.formField}>
            <label>Title sort: </label>
            <select value={form.abcSort} onChange={(e) => updateFields({ abcSort: e.target.value })}>
              <option value="" disabled>
                Choose title sort
              </option>
              {TITLE_CATEGORIES.map((abc) => {
                return (
                  <option key={`abc_${abc}`} value={abc}>
                    {abc}
                  </option>
                );
              })}
            </select>
          </div>

          <div className={styles.formField}>
            <label>Levels: </label>
            <div className={styles.levels}>
              <div className={styles.levelsSingle}>
                {["bSP", "BSP", "DSP", "ESP", "CSP"].map((difficulty) => {
                  return (
                    <div className={styles.formField} key={difficulty}>
                      <label>{difficulty}: </label>
                      <input
                        value={form[difficulty]}
                        onChange={(e) => {
                          updateFields({ [difficulty]: e.target.value });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className={styles.levelsDouble}>
                {["BDP", "DDP", "EDP", "CDP"].map((difficulty) => {
                  return (
                    <div className={styles.formField} key={difficulty}>
                      <label>{difficulty}: </label>
                      <input
                        value={form[difficulty]}
                        onChange={(e) => {
                          updateFields({ [difficulty]: e.target.value });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </form>
      <div className={styles.formPreContainer}>
        <pre className={styles.formPre}>{JSON.stringify(form, null, 2)}</pre>
      </div>
    </div>
  );
}
