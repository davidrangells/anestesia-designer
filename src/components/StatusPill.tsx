import { Status, STATUS_COLOR, STATUS_LABEL } from "@/lib/types";
export default function StatusPill({ status }: { status: Status }) {
  return <span className={`pill ${STATUS_COLOR[status]}`}>{STATUS_LABEL[status]}</span>;
}
