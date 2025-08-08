// src/lib/locations.ts

export interface LocationData {
  [province: string]: string[];
}

export const locationsData: LocationData = {
  "Gauteng": [
    "Johannesburg", 
    "Pretoria", 
    "Sandton", 
    "Soweto", 
    "Midrand", 
    "Centurion",
    "Randburg",
    "Roodepoort",
    "Katlehong", 
    "Vosloorus", 
    "Tembisa", 
    "Boksburg", 
    "Bryanston", 
    "Krugersdorp", 
    "Germiston", 
    "Alberton", 
    "Benoni", 
    "Springs", 
    "Vanderbijlpark", 
    "Vereeniging"
  ],
  // THIS IS THE UPDATED LIST FOR WESTERN CAPE
  "Western Cape": [
    "Cape Town",
    "Stellenbosch",
    "Bellville",
    "Durbanville",
    "Brackenfell",
    "Somerset West",
    "Hout Bay",
    "Simons Town",
    "Bloubergstrand",
    "Fish Hoek",
    "Atlantis",
    "Kalk Bay",
    "Sea Point",
    "Paarl", 
    "George", 
    "Knysna", 
    "Oudtshoorn", 
    "Mossel Bay", 
    "Worcester", 
    "Hermanus", 
    "Plettenberg Bay"
  ],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Richards Bay", "Margate", "Port Shepstone", "Ballito", "Newcastle", "Ladysmith"],
  "Eastern Cape": ["Port Elizabeth", "East London", "Grahamstown", "Uitenhage", "Jeffreys Bay", "Queenstown", "Mthatha"],
  "Free State": ["Bloemfontein", "Welkom", "Kroonstad", "Bethlehem", "Sasolburg"],
  "Limpopo": ["Polokwane", "Mokopane", "Thohoyandou", "Giyani", "Malamulele", "Phalaborwa", "Tzaneen", "Lephalale"],
  "Mpumalanga": ["Nelspruit", "Witbank", "Middelburg", "Ermelo", "Secunda", "Hazyview"],
  "North West": ["Rustenburg", "Potchefstroom", "Klerkstad", "Mahikeng", "Brits"],
  "Northern Cape": ["Kimberley", "Upington", "Springbok", "De Aar", "Kuruman"],
};

export const provinces = Object.keys(locationsData);
