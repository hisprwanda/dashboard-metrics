
import { faker } from "@faker-js/faker";
export type RegionData = {
  Region: string;
  District: string;
  Year: number;
  Month: string;
  Date: string;
  ActivityName: string;
};

const regions = [
  { region: "Bangui", districts: ["1st Arrondissement", "2nd Arrondissement", "3rd Arrondissement", "4th Arrondissement", "5th Arrondissement"] },
  { region: "Ombella-M'Poko", districts: ["Bimbo", "Boali", "Damara", "Yaloké"] },
  { region: "Lobaye", districts: ["Mbaïki", "Boda", "Boganda"] },
  { region: "Nana-Mambéré", districts: ["Bouar", "Baoro", "Baboua"] },
  { region: "Mambéré-Kadéï", districts: ["Berberati", "Carnot", "Gadzi"] },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const healthActivities = [
    "Community Health Awareness Campaign",
    "Vaccination Drive for Children",
    "Maternal Health Check-up Camp",
    "Distribution of Mosquito Nets",
    "Blood Donation Drive",
    "Hygiene and Sanitation Workshop",
    "Mental Health Counseling Sessions",
    "Nutrition and Wellness Program",
    "Training on First Aid and Emergency Care",
    "Health Screening for Non-Communicable Diseases",
  ];


export const generateData = async (): Promise<RegionData[]> => {
  return Array.from({ length: 20 }).map(() => {
    const randomRegion = faker.helpers.arrayElement(regions);
    const randomDistrict = faker.helpers.arrayElement(randomRegion.districts);

    return {
      Region: randomRegion.region,
      District: randomDistrict,
      Year: faker.date.future({ years: 3 }).getFullYear(),
      Month: faker.helpers.arrayElement(months),
      Date: faker.date.between({ from: "2020-01-01", to: "2024-12-31" }).toISOString().split("T")[0],
      //ActivityName: faker.company.catchPhrase(),
      ActivityName: faker.helpers.arrayElement(healthActivities)
    };
  });
};

//  const sampleData = generateData();
