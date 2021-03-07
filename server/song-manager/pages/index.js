import Head from 'next/head'
import Link from 'next/link'

import Layout from '../shared/Layout'
import { getSimfilesTsv } from '../lib/songs'

import Table from '../components/Table'
import styles from './index.module.scss'

export async function getStaticProps() {
  const songs = getSimfilesTsv()
  return {
    props: {
      songs,
    },
  }
}

export default function Home(props) {
  const { songs } = props

  return (
    <Layout>
      <div className={styles.header}>
        <h2>Song Manager</h2>
        <Link href="/new">
          <a>Add new song</a>
        </Link>
      </div>

      <Table songs={songs} />
    </Layout>
  )
}
