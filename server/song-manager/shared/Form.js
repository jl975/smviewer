import Link from "next/link";

import { useState, useEffect } from "react";

import styles from "./form.module.scss";
import { DDR_VERSIONS, TITLE_CATEGORIES } from "../data/constants";
import { getDisplayBpm, getEagateData } from "../clientUtils";
// import "./form.module.scss";

// import { getJacketPath } from "../lib/songs";

// export async function getStaticProps() {
//   const jacket = getJacketPath(song.hash);

//   return {
//     props: {
//       jacket,
//     },
//   };
// }

export default function Form(props) {
  const { song, jacket, isNew } = props;

  const [form, setForm] = useState(song);
  const [sm, setSm] = useState(null);
  const [smName, setSmName] = useState(song.smName);

  const [retrievingData, setRetrievingData] = useState(false);

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
    const fieldsToUpdate = {};

    setRetrievingData(true);

    if (smName) {
      fieldsToUpdate.smName = smName;
    }
    if (sm) {
      const displayBpm = getDisplayBpm(sm);
      fieldsToUpdate.displayBpm = displayBpm;
    }

    if (form.hash) {
      try {
        const res = await getEagateData(form.hash);
        console.log("res", res);
        let { title, artist, difficulties } = res;
        fieldsToUpdate.title = title;
        fieldsToUpdate.artist = artist;
        const difficultyMap = ["bSP", "BSP", "DSP", "ESP", "CSP", "BDP", "DDP", "EDP", "CDP"];
        difficulties.forEach((difficulty, idx) => {
          fieldsToUpdate[difficultyMap[idx]] = difficulty;
        });
      } catch (err) {}
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
            <label>ID: </label>
            <input
              value={form.hash}
              onChange={(e) => {
                updateFields({ hash: e.target.value });
              }}
              placeholder='e.g. "8bQQ0lP96186D8Ibo8IoOd6o16qioiIo"'
            />
          </div>
          <div className={styles.formField}>
            <label>SM File: </label>
            <input type="file" onChange={handleFileUpload} />
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

          <button type="button" onClick={fillAutomaticFields}>
            Fill automatic fields
          </button>
        </section>

        {retrievingData ? <p>Retrieving data, please wait...</p> : null}

        <section className={styles.automaticEntryFields}>
          <h3>Automatic entry fields</h3>
          {!isNew && (
            <div className={styles.formField}>
              <label>Index: </label>
              <span>{form.index}</span>
            </div>
          )}
          {jacket && (
            <div className={styles.formField}>
              <label>Jacket preview:</label>
              <img src={`data:image/png;base64,${jacket}`} alt={form.title} className={styles.jacketPreview} />
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
