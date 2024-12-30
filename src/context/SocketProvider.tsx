import { ReactNode, createContext, useState } from "react";

export const DataContext = createContext<any>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<any>(null)

    const initState = {
        socket,
        setSocket
    }
    return (
        <DataContext.Provider value={initState} >
            {children}
        </DataContext.Provider>
    );
};