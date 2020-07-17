import Head from "next/head";
import Link from "next/link";

import Layout from "../shared/Layout";
import { getSimfilesTsv } from "../lib/songs";

import Table from "./Table";

export async function getStaticProps() {
  const songs = getSimfilesTsv();
  return {
    props: {
      songs,
    },
  };
}

export default function Home(props) {
  const { songs } = props;

  return (
    <Layout>
      <h2>Song Manager</h2>

      <Table songs={songs} />
    </Layout>
  );
}
