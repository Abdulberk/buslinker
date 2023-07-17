import React from "react";
import styles from "./styles.module.scss";

function Footer() {
  const menuItems = [
    {
      title: "Bus Companies",
      items: [
        { title: "Metro Turizm", link: "/metro-turizm" },
        { title: "Kamil Koç", link: "/kamil-koc" },
        { title: "Ulusoy", link: "/ulusoy" },
        { title: "Nilüfer Turizm", link: "/nilufer-turizm" },
      ],
    },
    {
      title: "Popular Travels",
      items: [
        { title: "İstanbul - Ankara", link: "/istanbul-ankara" },
        { title: "İstanbul - İzmir", link: "/istanbul-izmir" },
        { title: "İstanbul - Antalya", link: "/istanbul-antalya" },
        { title: "İstanbul - Bursa", link: "/istanbul-bursa" },
      ],
    },
    {
      title: "All Terminals",
      items: [
        { title: "İstanbul", link: "/istanbul" },
        { title: "Ankara", link: "/ankara" },
        { title: "İzmir", link: "/izmir" },
        { title: "Antalya", link: "/antalya" },
      ],
    },
    {
      title: "Flight Tickets",
      items: [
        { title: "Turkish Airlines", link: "/turkish-airlines" },
        { title: "Pegasus", link: "/pegasus" },
        { title: "Anadolu Jet", link: "/anadolu-jet" },
        { title: "Onur Air", link: "/onur-air" },
      ],
    },
    {
      title: "About Us",
      items: [
        { title: "Blog", link: "/blog" },
        { title: "Basında Biz", link: "/basinda-biz" },
        { title: "KVKK", link: "/kvkk" },
        { title: "Reklam", link: "/reklam" },
      ],
    },
    {
      title: "Bus Ticket",
      items: [
        { title: "Travels", link: "/travels" },
        { title: "Bus Companies", link: "/bus-companies" },
        { title: "Check Ticket", link: "/check-ticket" },
        { title: "Popular Travels", link: "/popular-travels" },
      ],
    },
  ];

  const socialMediaIcons = [
    "Facebook.svg",
    "Twitter.svg",
    "Youtube.svg",
    "Tiktok.svg",
    "Instagram.svg",
    "Telegram.svg",
  ];

  const paymentIcons = [
    "mastercard.svg",
    "visa.svg",
    "amex.svg",
    "paypal.svg",
    "discover.svg",
    "stripe.svg",
  ];


  return (
    <div className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <img src={process.env.PUBLIC_URL + "/redlogo.svg"} alt="logo" />
          </div>
          <div className={styles.download}>
            <img src={process.env.PUBLIC_URL + "/playstore.svg"} alt="googleplay" />
            <img src={process.env.PUBLIC_URL + "/appstore.svg"} alt="appstore" />
          </div>
          <div className={styles.divider} />
          <div className={styles.address}>
            <div className={styles.upText}>
              <p>
                Buslinker Inc.<br />
                Travel Warrant<br />
                No:7487
              </p>
            </div>
            <div className={styles.bottomText}>
              <p>All rights reserved
                <br />
                © 2023
              </p>
            </div>
          </div>
        </div>
        <div className={styles.items}>
        {menuItems.map((menu, index) => (
          <div className={styles.list} key={index}>
            <h3>{menu.title}</h3>
            {menu.items.map((item, index) => (
              <a href={item.link} key={index}>{item.title}</a>
            ))}
          </div>
        ))}
      </div>
        <div className = {styles.right} >
          <div className = {styles.subscribe} >
                <h1>
                Subscribe to our newsletter
                </h1>
                <p>
                Sign up and we'll send the best deals <br/> to you
                </p>
                <div className = {styles.input} >
                  <input type = "text" placeholder = "Enter your email address" />
                  <div className = {styles.submit} >
                    <img src = {process.env.PUBLIC_URL + "/subscribe.svg"} alt = "send" />
                    </div>
                  </div>
            </div>
            <div className={styles.socials}>
        <h1>Follow us on social media</h1>
        <div className={styles.icons}>
          {socialMediaIcons.map((icon, index) => (
            <div className = {styles.icon} key={index}>
            <img
              key={index}
              src={process.env.PUBLIC_URL + "/" + icon}
              alt={icon}
            />
            </div>
          ))}
        </div>
      </div>
        </div>
      </div>
      <div className={styles.payment}>
        {paymentIcons.map((icon, index) => (
          <img
            key={index}
            src={process.env.PUBLIC_URL + "/" + icon}
            alt="payment"
          />
        ))}
      </div>
      <div className={styles.bottom}>
        <h3>© 2021 - 2022</h3>
        <h3>All rights reserved</h3>
        <h3>Privacy Policy</h3>
      </div>
    </div>
  );
}

export default Footer;
