"use client";

import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDayandMonthDateString } from "@/lib/utils";
import { Profile, SocialMediaLink } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAllVerifiedProfile } from "../actions/getAllVerifiedProfile";
import JoinRequestList from "./JoinRequestList";
import SearchBar from "./SearchBar";
import SocialMediaList from "./SocialMediaList";

interface ExtendedProfile extends Profile {
  socialMediaLinks: SocialMediaLink[];
}

const Home = () => {
  const [profiles, setProfiles] = useState<ExtendedProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const user = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/user");
      return response.json();
    },
  });

  const { data, isLoading } = user;

  useEffect(() => {
    (async () => {
      try {
        const profiles = await getAllVerifiedProfile();
        if (!profiles?.error && profiles?.data) {
          const extendedProfiles = profiles.data.map((profile) => ({
            ...profile,
            socialMediaLinks: profile.socialMediaLinks || [], // Ensure socialMediaLinks is always present
          }));
          setProfiles(extendedProfiles);
        }
      } catch (error) {
        toast.error(error as string, {
          autoClose: 1000,
        });
      }
    })();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredProfiles = profiles.filter((profile) => {
    const query = searchQuery.toLowerCase();

    if (!profile.firstName || !profile.lastName) return false;
    return (
      profile.firstName.toLowerCase().includes(query) ||
      profile.lastName.toLowerCase().includes(query) ||
      (profile.dob &&
        getDayandMonthDateString(profile.dob).toLowerCase().includes(query)) ||
      (profile.career && profile.career.toLowerCase().includes(query)) ||
      (profile.country && profile.country.toLowerCase().includes(query)) ||
      (profile.state && profile.state.toLowerCase().includes(query))
    );
  });

  return (
    <SkeletonWrapper isLoading={isLoading}>
      <div>
        <h1 className="text-xl font-bold">Hello {data && data.name} 👋</h1>
      </div>
      <div className="my-6">
        <JoinRequestList />
      </div>
      <div className="flex flex-col md:justify-center md:items-center">
        <p className="md:text-2xl sm:text-xl  font-bold  mt-4">
          AirForce Secondary School Ikeja Class of 2007
        </p>
        <p className="md:text-base sm:text-sm text-gray-500">
          Here you can find information about your classmates.
        </p>
        <div className="md:w-2/4 mt-6">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <Table>
        <TableCaption>
          Members of the AirForce Secondary School Ikeja Class of 2007
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Birth Date</TableHead>
            <TableHead>Career</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Social Media</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProfiles.map((profile) => {
            return (
              <TableRow key={profile.id}>
                <TableCell>{profile.firstName}</TableCell>
                <TableCell>{profile.lastName}</TableCell>
                <TableCell>{getDayandMonthDateString(profile.dob)}</TableCell>
                <TableCell>{profile.career}</TableCell>
                <TableCell>
                  {profile.country}, {profile.state}
                </TableCell>
                <TableCell>
                  <SocialMediaList
                    socialMediaLinks={profile.socialMediaLinks}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </SkeletonWrapper>
  );
};

export default Home;
