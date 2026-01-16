import { caller } from "@/trpc/server";
import ProfileScreenClient, {
  ProfileBasicInfo,
} from "./profile-screen-client";

export const dynamic = "force-dynamic";

const ProfilePage = async () => {
  const basicInfo = (await caller.user.getBasicInfo()) as unknown as ProfileBasicInfo;

  return <div className="mt-10"><ProfileScreenClient basicInfo={basicInfo} /></div>;
};

export default ProfilePage;

