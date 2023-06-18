import { readFileSync, writeFileSync } from 'fs'

/*
Utility file to translate the CSV data from the Bundesnetzagentur into usable JSON
Data comes from https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/E-Mobilitaet/Ladesaeulenkarte/start.html
Download the Excel file, remove the part before the header and save as tsv, then this script generates the rest
*/

const parseCSV = (file, delimiter="\t") => {
    // Split into lines and filter empty lines, do the same for each row
    const lines = file.split('\n').filter(e => e).map(e => e.split(delimiter))
    const header = lines[0].map(e => e.trim())
    
    return lines.slice(1).map(row => {
        let obj = {}
        for(let i=0; i<header.length; i++) {
            const key = header[i]
            const value = row[i].trim();
            obj[key] = value;
        }
        return obj
    })
}

const chargingConnectorNameMap = {
    // Not 100% sure but I think kupplung and Steckdose mean the same thing
    'AC Steckdose Typ 2': 'Type2',
    'AC Kupplung Typ 2': 'Type2',
    'DC Kupplung Combo': 'CCS',
    'DC CHAdeMO': 'CHAdeMO',
    // This is a very german abbreviation
    'AC Schuko': 'Schuko',
    // 3-Phase power aka CEE, I think EU-only
    'AC / CEE': 'CEE',
    'CEE-Stecker': 'CEE',
    'AC CEE 5 polig': 'CEE5Pin',
    'AC CEE 3 polig': 'CEE3Pin',
    // Tesla's connector is a differently pinned Type2
    'Tesla': 'Tesla',
    // Not sure what this is though
    'Typ 2 / Tesla': 'Type2Tesla',
    'DC Kupplung Tesla Typ 2': 'Type2Tesla',
    // Also not sure about this one, so classified as Type2
    'Adapter Typ1  Auto auf Typ2 Fahrzeugkupplung': 'Type2',
    'Adapter Typ1  Auto auf Typ2 Fahrzeugkupplung': 'Type2',
}   

const cleanupBNEStation = (stationInfo) => {
    return {
        operator: stationInfo['Betreiber'],
        location: {
            street: stationInfo['Straße'],
            number: stationInfo['Hausnummer'],
            supplement: stationInfo['Adresszusatz'],
            city: stationInfo['Ort'],
            district: stationInfo['Kreis/kreisfreie Stadt'],
            state: stationInfo['Bundesland'],
            zipCode: stationInfo['Postleitzahl'],
            lat: stationInfo['Breitengrad'],
            lng: stationInfo['Längengrad']
        },
        commissioningDate: stationInfo['Inbetriebnahmedatum'],
        totalCapacity: stationInfo['Anschlussleistung'],
        // This is: Normalladeeinrichtung | Schnellladeeinrichtung, so we parse it to something useful
        type: {
            'Normalladeeinrichtung': 'normal',
            'Schnellladeeinrichtung': 'fast',
        }[stationInfo['Art der Ladeeinrichung']],
        chargerCount: parseInt(stationInfo['Anzahl Ladepunkte']),
        chargerInfo: new Array(4).fill(0)
            // Invalid chargers have empty capacities 
            .filter((_, i) => stationInfo[`P${i+1} [kW]`].length > 0)
            .map((_, i) => ({
                capacity: parseFloat(stationInfo[`P${i+1} [kW]`]),
                connectorTypes: [...(new Set(
                        stationInfo[`Steckertypen${i+1}`].split(/[,;]/gm)
                        .map(e => e.trim())
                        .filter(e => e)
                        // Remap to a more useful name
                        .map(e => chargingConnectorNameMap[e])
                    ))
                ],
                publicKey: stationInfo[`Public Key${i+1}`],
            }))
    }
}

const chargingStationsBNE = parseCSV(readFileSync('src/assets/data/Ladesaeulenregister - Ladesäulenregister BNetzA.tsv').toString())
    .map(s => cleanupBNEStation(s))

writeFileSync('src/assets/data/chargingStationsBNE.json', JSON.stringify(chargingStationsBNE))