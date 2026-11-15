import { laadDocumenten } from "../laden";
import AlvClient from "./AlvClient";

export default async function AlvPage({ searchParams }: { searchParams: Promise<{ nieuw?: string; id?: string }> }) {
  const [{ nieuw, id }, { items, error }] = await Promise.all([searchParams, laadDocumenten("alv")]);
  return <AlvClient items={items} loadError={error} startNieuw={nieuw !== undefined} startId={id} />;
}
