export function close_all_details_except(details_element: HTMLDetailsElement | null) {
  const details = document.getElementsByTagName("details");
  for (const detail of details) {
    if (detail !== details_element) {
      detail.open = false;
    }
  }
}
