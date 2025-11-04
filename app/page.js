
// import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.DivLog}>
          <h2>
            DOCS COMPILANCE
          </h2>
          <h4 className={styles.welc}>
            Welcome Back!
          </h4>
          <p>
            Sing in to start save your time & money.
          </p>
          <div>
            <form className={styles.LogForm}>
              <input placeholder="Login" type="text"></input>
              <input placeholder="P@ssword" type="password"></input>
            </form>
          </div>
        </div>
        <div className={styles.DivDesc}>
          <p>
            <span>Docs Compliance</span> - kompleksowy system do zarządzania wszystkimi terminami i wymaganiami regulacyjnymi Twojej firmy.
          </p>
          <p className={styles.copy}>
            copyright © 2025 Docs Compliance
          </p>
        </div>
      </main>
    </div>
  );
}
