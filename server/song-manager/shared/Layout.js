import Head from "next/head";

import styles from "./layout.module.scss";

export default function Layout({ children }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>SMViewer Song Manager</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
      </Head>
      {children}
    </div>
  );
}
