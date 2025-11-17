import { HttpStatusCode } from "axios";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { urlBackEnd } from "../../../../../lib/utils/baseUrl";
import { hashPwd } from "../../../../../lib/utils/encryption";
import { generateMemberId } from "../../../../../lib/utils/gen-member-id";
import prisma from "../../../../../lib/utils/prisma.utils";
import env from "../../../../config/clean-env";
import AppError from "../../../../errors/appError";

export const googleStrategy = new GoogleStrategy(
  {
    clientID: env.GOOGLE_CLIENT_ID!,
    clientSecret: env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${urlBackEnd}/api/v1/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    // console.log("🚀 ~ refreshToken:", refreshToken);
    // console.log("🚀 ~ accessToken:", accessToken);
    // console.log("🚀 ~ accessToken:", profile, done);
    try {
      // console.log("🎯 Basic Google Profile:", {
      //   email: profile.emails?.[0]?.value,
      //   name: profile.displayName,
      //   locale: profile._json?.locale,
      // });

      // Extract country from basic profile (locale)
      //const basicCountry = profile._json?.locale?.split("-")[1] || null;
      // let detailedCountry = null;
      // let detailedProfile = null;

      // Try to get detailed profile if access token is available
      // if (accessToken) {
      //   detailedProfile = await getDetailedGoogleProfile(accessToken);
      //   detailedCountry = detailedProfile?.locations?.[0]?.countryCode || null;

      //   console.log("📍 Country info:", {
      //     fromLocale: basicCountry,
      //     fromPeopleAPI: detailedCountry,
      //     locations: detailedProfile?.locations,
      //   });
      // }

      // Use detailed country if available, otherwise fallback to basic country
      // const country = detailedCountry || basicCountry;
      // Check if user exists with this googleId
      let user = await prisma.user.findFirst({
        where: {
          email: profile.emails?.[0]?.value,
          OR: [{ googleId: profile.id }, { email: profile.emails?.[0]?.value }],
        },
      });

      /**
       * {
      id: '116038782161839341989',
      displayName: 'Tanvir Hossain',
      name: { familyName: 'Hossain', givenName: 'Tanvir' },
      emails: [ { value: 'developer.tanvirhossain@gmail.com', verified: true } ],
      photos: [
        {
          value: 'https://lh3.googleusercontent.com/a/ACg8ocIOCBkssg6qCWxE1xiopX1NwSmk_ArtdjOKJe4HlHMyOQhK2us=s96-c'
        }
      ],
      provider: 'google',
      _raw: '{\n' +
        '  "sub": "116038782161839341989",\n' +
        '  "name": "Tanvir Hossain",\n' +
        '  "given_name": "Tanvir",\n' +
        '  "family_name": "Hossain",\n' +
        '  "picture": "https://lh3.googleusercontent.com/a/ACg8ocIOCBkssg6qCWxE1xiopX1NwSmk_ArtdjOKJe4HlHMyOQhK2us\\u003ds96-c",\n' +
        '  "email": "developer.tanvirhossain@gmail.com",\n' +
        '  "email_verified": true\n' +
        '}',
      _json: {
        sub: '116038782161839341989',
        name: 'Tanvir Hossain',
        given_name: 'Tanvir',
        family_name: 'Hossain',
        picture: 'https://lh3.googleusercontent.com/a/ACg8ocIOCBkssg6qCWxE1xiopX1NwSmk_ArtdjOKJe4HlHMyOQhK2us=s96-c',
        email: 'developer.tanvirhossain@gmail.com',
        email_verified: true
      }
    } * 
        */
      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: profile.emails?.[0]?.value!,
            googleId: profile.id,
            authMethod: "GOOGLE",
            isVerified: true,
            role: "MEMBER",
            isBlocked: false,
            memberId: generateMemberId(
              profile.name?.givenName ||
                profile._json.given_name ||
                profile.name?.familyName!,
            ), // Your member ID generation logic
            password: await hashPwd("123456"),

            // Create minimal profile
            profile: {
              create: {
                firstName: profile.name?.givenName || "",
                lastName: profile.name?.familyName || "",
                phoneNumber: "",
                fullName: `${profile.name?.givenName} ${profile.name?.familyName}`,
                userImage: profile.photos?.[0]?.value || "",
              },
            },

            address: {
              create: {
                country: "N/A",
                state: "N/A",
                city: "N/A",
                street: "N/A",
              },
            },
          },
        });
      } else if (!user.googleId) {
        // User exists but without googleId - link accounts
        if (user.authMethod === "EMAIL_PASS") {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: profile.id,
            },
          });
          throw new AppError(
            HttpStatusCode.BadRequest,
            `You've already registered with ${user.authMethod.toLocaleLowerCase()}!`,
          );
        } else {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: profile.id,
              profile: {
                update: {
                  userImage: profile.photos?.[0]?.value || "",
                },
              },
            },
          });
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error, undefined);
    }
  },
);

// Function to get detailed profile using Google People API with proper OAuth
// async function getDetailedGoogleProfile(accessToken: string) {
//   try {
//     // Create OAuth2 client with the access token
//     const oauth2Client = new google.auth.OAuth2();
//     console.log("🚀 ~ getDetailedGoogleProfile ~ oauth2Client:", oauth2Client);
//     oauth2Client.setCredentials({
//       access_token: accessToken,
//     });

//     const people = google.people({
//       version: "v1",
//       auth: oauth2Client, // Pass the OAuth2 client, not the token directly
//     });

//     const response = await people.people.get({
//       resourceName: "people/me",
//       personFields: "locations,birthdays,genders,phoneNumbers,addresses",
//     });
//     console.log("🚀 ~ getDetailedGoogleProfile ~ response:", response);

//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching detailed Google profile:", error);
//     return null;
//   }
// }
