-- This is an empty migration.-- Enable PostGIS (safe if rerun)
CREATE EXTENSION IF NOT EXISTS postgis;
-- Opcional (se for usar topologia/rasters no futuro):
-- CREATE EXTENSION IF NOT EXISTS postgis_topology;
-- CREATE EXTENSION IF NOT EXISTS postgis_raster;
