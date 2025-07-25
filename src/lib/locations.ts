// src/lib/locations.ts

export interface LocationData {
  [province: string]: string[];
}

export const locationsData: LocationData = {
  "Gauteng": ["Johannesburg", "Pretoria", "Sandton", "Soweto", "Midrand", "Katlehong", "Vosloorus", "Tembisa", "Boksburg", "Randburg", "Bryanston"],
  "Western Cape": ["Cape Town", "Stellenbosch", "Paarl", "George"],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Richards Bay"],
  "Eastern Cape": ["Port Elizabeth", "East London", "Grahamstown"],
  "Free State": ["Bloemfontein", "Welkom"],
  "Limpopo": ["Polokwane", "Mokopane", "Thohoyandou", "Giyani", "Malamulele"],
  "Mpumalanga": ["Nelspruit", "Witbank"],
  "North West": ["Rustenburg", "Potchefstroom"],
  "Northern Cape": ["Kimberley", "Upington"],
};

export const provinces = Object.keys(locationsData);