import type { Component } from "solid-js";

import { createEffect, createSignal, For, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import logo from "./logo.svg";
import styles from "./App.module.css";

import jumper_1 from "./assets/jumper_gifs/1.gif";
import jumper_2 from "./assets/jumper_gifs/2.gif";
import jumper_3 from "./assets/jumper_gifs/3.gif";

import jumper_1_img from "./assets/jumper_imgs/1.png";
import jumper_2_img from "./assets/jumper_imgs/2.png";
import jumper_3_img from "./assets/jumper_imgs/3.png";
import { close_all_details_except } from "./utils/ui";
import { Active_collectors } from "./types/Active_collectors";
import { c } from "vite/dist/node/types.d-aGj9QkWt";

const [money, setMoney] = createSignal(JSON.parse(localStorage.getItem("money") || "0"));
const [pot, setPot] = createSignal(JSON.parse(localStorage.getItem("pot") || "0"));


function receive_money(amount: number) {
  if (away_from_browser) {
    setPot((value) => value + amount);
  } else {
    setMoney((value) => value + amount);
  }
}


document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
      console.log('User is away from the browser');
  } else {
      console.log('User is active in the browser');
  }
});


function save_progress() {
  localStorage.setItem("money", money());
}

setInterval(save_progress, 100);

const [active_collectors, setActiveCollectors] = createStore<
  Active_collectors[]
>(JSON.parse(localStorage.getItem("active_collectors")!) || [
  {
    name: "collector1",
    value: 20,
    jumper_gif: jumper_1,
    jumper_img: jumper_1_img,
    speed: 2,
    has_manger: false,
  },
  {
    name: "collector2",
    value: 20,
    jumper_gif: jumper_2,
    jumper_img: jumper_2_img,
    speed: 1,
    has_manger: true,
  },
  {
    name: "collector3",
    value: 20,
    jumper_gif: jumper_3,
    jumper_img: jumper_3_img,
    speed: 3,
    has_manger: false,
  },
]);


createEffect(() => {
  localStorage.setItem("active_collectors", JSON.stringify(active_collectors));
});


createEffect(() => {
  console.log(active_collectors)
});


const App: Component = () => {
  return (
    <div class={styles.App}>
      <button onclick={() => document.body.classList.toggle("dark-mode")}>dark mode</button>
      <h1 id={styles.money}>Money: ${money()}</h1>
      <h2 id={styles.money}>Pot: ${pot()}</h2>
      <div id={styles.collectors}>
        <For each={active_collectors}>
          {(collector, index): any => (
            <Collector index={index()} collector={collector} />
          )}
        </For>
      </div>
    </div>
  );
};

export default App;
function Collector({
  collector,
  index,
}: {
  collector: Active_collectors;
  index: number;
}) {
  const [collection_completion_value, setCollectionCompletionValue] =
    createSignal(0);

  const [IsCollecting, setIsCollecting] = createSignal(false);

  let details_ref: HTMLDetailsElement | undefined;


  function stop_collecting(interval: any) {
    clearInterval(interval);
    setIsCollecting(false);
  }

  function collect() {
    setIsCollecting(true);
    const interval = setInterval(() => {
      setCollectionCompletionValue((value) => {
        const new_value = value + 1;
        if (new_value >= collector.value) {
          receive_money(collector.value);
          if (!collector.has_manger) {
            stop_collecting(interval);
          }
          return 0;
        }
        return new_value;
      });
    }, 1000 / collector.speed);
  }
  return (
    <div class={styles.collector}>
      <div class={styles.collector_top_level}>
        <img
          src={IsCollecting() ? collector.jumper_gif : collector.jumper_img}
        />
        <div class={styles.non_image}>
          <p>{collector.name}</p>
          <p>{collector.value}</p>
          <progress
            value={collection_completion_value()}
            max={collector.value}
          ></progress>
          <button class={styles.collect} onclick={() => {if (!IsCollecting()) collect()}}>collect</button>
        </div>
      </div>



      <details ref={details_ref} onclick={() => close_all_details_except(details_ref!)} class={styles.upgrades}>
        <summary>upgrades</summary>
        <div class={styles.inner_content}>

        <Purchase_button index={index} collector={collector} field="speed" />
        <Purchase_button index={index} collector={collector} field="value" />
        </div>
      </details>
    </div>
  );
}


function Purchase_button({ collector, field, index }: { index: number, collector: Active_collectors; field: "speed" | "value" }) {
  const purchase_value = collector[field] + 10;

  return (
    <>
      <p>{field}: {collector[field]}</p>
      <button
        disabled={money() < purchase_value}
        onclick={() => {
          if (purchase_attempt(purchase_value)) {
            setActiveCollectors(index, field, (prev) => prev + 10);
          }
        }}
      >
        upgrade: {field} (${purchase_value})
      </button>
    </>
  );
}


function purchase_attempt(amount: number ): boolean {
  if (money() >= amount) {
    setMoney((value) => value - amount);
    return true;
  }
  return false;
}


document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    close_all_details_except(null);
  }
});

window.addEventListener("click", (event) => {
    close_all_details_except((event.target as HTMLElement).closest("details")!);
})






let away_from_browser = false;

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
            away_from_browser = true;
          } else {
            away_from_browser = false;
    }
});