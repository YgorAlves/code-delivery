import { Loader } from "google-maps";
import { FormEvent, FunctionComponent, useCallback, useEffect, useRef, useState } from "react";
import { getCurrentPosition } from "../util/geolocation";
import { makeCarIcon, makeMarkerIcon, Map } from "../util/map";
import { Route } from "../util/models";
import { sample, shuffle } from 'lodash';
import { RouteExistsError } from "../errors/route-exists.error";
import { useSnackbar } from "notistack";
import { Navbar } from "./Navbar";
import { Button, Grid, MenuItem, Select } from "@mui/material";
import io from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL as string;
const googleMapsLoader = new Loader(process.env.REACT_APP_GOOGLE_API_KEY);

const colors = [
  "#b71c1c",
  "#4a148c",
  "#2e7d32",
  "#e65100",
  "#2962ff",
  "#c2185b",
  "#FFCD00",
  "#3e2723",
  "#03a9f4",
  "#827717",
];


export const Mapping: FunctionComponent = () => {

    const [routes, setRoutes] = useState<Route[]>([]);
    const [routeIdSelected, setRouteIdSelected] = useState<string>("");
    const mapRef = useRef<Map>();
    const socketIORef = useRef<io.Socket>();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
      socketIORef.current = io.connect(API_URL);
      socketIORef.current.on('connect', () => console.log('conectou'))
    }, [])

    useEffect(() => {
        fetch(`${API_URL}/routes`)
            .then((data) => data.json())
            .then((data) => setRoutes(data));
    }, []);

    useEffect(() => {
      (async () => {
        const [, position] = await Promise.all([
          googleMapsLoader.load(),
          getCurrentPosition({enableHighAccuracy: true})
        ]);

        const divMap = document.getElementById('map') as HTMLElement;
        mapRef.current = new Map(divMap, {
          zoom: 15,
          center: position
        })

      }) ();
    }, [])

    const startRoute = useCallback((event: FormEvent) => {
      event.preventDefault()
      const route = routes.find(route => route._id === routeIdSelected)
      const color = sample(shuffle(colors)) as string;

      try {
        mapRef.current?.addRoute(routeIdSelected, {
          currentMarkerOptions: {
            position: route?.startPosition,
            icon: makeCarIcon(color)
          },
          endMarkerOptions: {
            position: route?.endPosition,
            icon: makeMarkerIcon(color)
          }
        })

        socketIORef.current?.emit('new-direction', {
          routeId: routeIdSelected
        })
      } catch (error) {
        if (error instanceof RouteExistsError) {
          enqueueSnackbar(`${route?.title} já adicionado, esperar finalizar`, {
            variant: 'error'
          });
          return;
        }
        throw error;
      }

    }, [routeIdSelected, routes, enqueueSnackbar]);

    return (
        <Grid container 
        style={{
          width: '100%',
          height: '100%'
        }}>
            <Grid item xs={12} sm={3}>
                <Navbar />
                <form onSubmit={startRoute} style={{ margin: '16px' }}>
                    <Select 
                        fullWidth 
                        displayEmpty 
                        value={routeIdSelected} 
                        onChange={(event) => setRouteIdSelected(event.target.value + "")}
                    >
                        <MenuItem value="">
                            <em>Selecione uma corrida</em>
                        </MenuItem>
                        {routes.map((route, key) => (
                            <MenuItem key={key} value={route._id}>
                                <em>{route.title}</em>
                            </MenuItem>
                        ))}
                    </Select>
                    <div 
                      style={{
                        textAlign: 'center',
                        marginTop: '8px'
                      }}>
                      <Button type="submit" color="primary" variant="contained">
                          Iniciar uma corrida
                      </Button>
                    </div>
                </form>
            </Grid>
            <Grid item xs={12} sm={9}>
                <div id="map" 
                style={{
                  width: '100%',
                  height: '100%'
                }} />
            </Grid>
        </Grid>
    );
};