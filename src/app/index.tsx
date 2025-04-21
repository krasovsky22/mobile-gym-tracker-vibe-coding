import { Redirect, usePathname } from 'expo-router';

export default function App() {
  const pathname = usePathname();
  console.log(pathname);

  return <Redirect href="/home" />;
}
