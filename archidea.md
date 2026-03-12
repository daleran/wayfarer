Hmmm. I hate how the map files each have to include all the types together. I don't like this layout.                                                                                           
                                                                                                
In my mind, it would be better if map files just contained lists of zones and where to place the zones. So things in a zone are placed relative to where the zone is placed. Zones would be        
radius based                                                                                      
                                                                                                
Zones just contain a straight list of all the entities. THey don't need to be seperated by type or anything. World Entities like stations, derelicts, planets, locations, zone specific decorations, etc live in the zone folder with that zone. So when you load a Zone, you get the     
entire kit and kaboodle.                                                                          
                                                                                                
Shared things like, say, some floating asteroid, or some other reusable components can go in a world/shared folder. So, here is my ideal architecture.   

Maybe if we can use duck typing to just include an 'instantiate' function to all the different entity types that the map can just call?

Also, I want the station layout to be stored with the station file. No seperation of concerns. The ui layer should be fairly content agnostic, and just be fed data and behavior by the game content layer

This is just an example:


ai/
    shipAi.js
/entities
    /world <- Anything static to a world. It 'belongs' to the world
        /zones
            gravewake/
                planetPale.js
                theCoil/
                    coilStation.js
            vespa/
        station.js
        planet.js
        stationRegsitry.js
        planetRegistry.js
    /maps
        arena.js
        tyr.js
        stationTest.js
    /shared
        spines.js
        wallOfWrecks.js
    /items
        modules.js
        commodities.js
        lootTables.js
    /agents <- Anything that moves in the world
    /npcs
        cresfallOrin.js
    /ships
        /classes
            g100Hauler.js
        /derelicts
            coldRemanant.js
        /named
            hullbreaker.js
            paleWitness.js
        ship.js
        shipRegistry.js
    entities.js
    projectile.js
systems/
    tuning/
        aiTuning.js
    engineglow.js


Please Analyze this plan. What I do now is that I tried to add The Coil to the arena map, and I could not figure it out. I could not get it to work either. It was far too convoluted.

