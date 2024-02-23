import { MainPage } from "./components/MainPage";
import { UserContext } from "./context-provider";

export default function Home() {
  return (
    <>
      <UserContext>
        <MainPage />
      </UserContext>
    </>
  );
}
