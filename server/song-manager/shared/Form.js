import Link from "next/link";
import { Input } from "semantic-ui-react";

import { useState, useEffect } from "react";

import styles from "./form.module.scss";
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
  const { song, jacket } = props;

  const [form, setForm] = useState(song);

  useEffect(() => {
    console.log("holla");

    const [bSP, BSP, DSP, ESP, CSP, BDP, DDP, EDP, CDP] = form.levels.split(",");

    const initForm = { ...form, bSP, BSP, DSP, ESP, CSP, BDP, DDP, EDP, CDP };
    setForm(initForm);
  }, []);

  const updateFields = (newFields) => {
    setForm({ ...form, ...newFields });
  };

  return (
    <div className={styles.container}>
      <form className={styles.formContainer}>
        <h2>{props.isNew ? "Add" : "Edit"} song</h2>
        <div className={styles.formField}>
          <label>Index: </label>
          <span>{form.index}</span>
        </div>
        <div className={styles.formField}>
          <label>ID: </label>
          <input
            value={form.hash}
            onChange={(e) => {
              updateFields({ hash: e.target.value });
            }}
          />
        </div>
        <div className={styles.formField}>
          <label>Jacket preview:</label>
          <img src={`data:image/png;base64,${jacket}`} alt={form.title} className={styles.jacketPreview} />
        </div>
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
          <label>Version: </label>
          <input value={form.version} />
        </div>
        <div className={styles.formField}>
          <label>Display BPM: </label>
          <input
            type="number"
            min="1"
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
        <div className={styles.formField}>
          <label>Title sort: </label>
          <input value={form.abcSort} />
        </div>
        <div className={styles.formField}>
          <label>Audio URL: </label>
          <input value={form.dAudioUrl} />
        </div>
      </form>
      <div className={styles.formPreContainer}>
        <pre className={styles.formPre}>{JSON.stringify(song, null, 2)}</pre>
      </div>
    </div>
  );
}
