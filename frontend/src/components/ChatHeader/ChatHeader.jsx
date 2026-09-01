import { ChevronDown } from "lucide-react";

import styles from "./ChatHeader.module.css";

export default function ChatHeader() {
  return (
    <header className={styles.header}>
      {/* Chat title */}
      <div className={styles.left}>
        <span>ChatGPT</span>
        <ChevronDown size={16} />
      </div>

      {/* User avatar */}
      <div className={styles.right}>
        <div className={styles.avatar}>IT</div>
      </div>
    </header>
  );
}
