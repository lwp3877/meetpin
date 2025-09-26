export async function getServerSideProps(){ return { props: { ts: Date.now() } }; }

export default function Status({ ts }: { ts:number }) {
  return (<main>OPS STATUS OK · {ts}</main>);
}