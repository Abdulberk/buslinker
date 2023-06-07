import React from 'react'
import  { useState, useEffect } from 'react'
import styles from './styles.module.scss'


export interface Tab {
    title: string;
    icon: string;
    activeIcon?: string;
    content?: React.ReactNode;

  }
  
  interface TabsProps {
    children?: React.ReactNode;
    tabs: Tab[];
    activeTab: string;
    setActiveTab: (tab: string) => void;
  }
  


function Tabs({
    children,
    tabs,
    activeTab,
    setActiveTab,
    ...props

}: TabsProps) {


  return (
    <div>

        <div className = {styles.tabsContainer}>
          <div className = {styles.tabs}>
            {
                tabs.map((tab) => (
                    <div
                        key = {tab.title}
                        className = {tab.title === activeTab ? styles.activeTab : styles.tab}
                        onClick = {() => setActiveTab(tab.title)}
                    >
                        <img src = {
                            tab.title === activeTab ? tab.activeIcon : tab.icon
                        } alt = {tab.title} />
                        <p>{tab.title}</p>

                        

                    </div>
                    
                ))


            }

            </div>
          
           
            
        </div>

    </div>
  )
}

export default Tabs