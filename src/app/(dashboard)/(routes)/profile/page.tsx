import { caller } from "@/trpc/server";
import ProfileScreenClient, {
  ProfileBasicInfo,
} from "./profile-screen-client";

export const dynamic = "force-dynamic";

const ProfilePage = async () => {
  const basicInfo = (await caller.user.getBasicInfo()) as unknown as ProfileBasicInfo;

  return <ProfileScreenClient basicInfo={basicInfo} />;
};

export default ProfilePage;

