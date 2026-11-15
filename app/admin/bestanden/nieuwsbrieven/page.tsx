import { laadDocumenten } from "../laden";
import NieuwsbrievenClient from "./NieuwsbrievenClient";

export default async function NieuwsbrievenPage({ searchParams }: { searchParams: Promise<{ nieuw?: string; id?: string }> }) {
  const [{ nieuw, id }, { items, error }] = await Promise.all([searchParams, laadDocumenten("nieuwsbrieven")]);
  return <NieuwsbrievenClient items={items} loadError={error} startNieuw={nieuw !== undefined} startId={id} />;
}
