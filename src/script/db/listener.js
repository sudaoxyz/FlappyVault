// chrome.storage.onChanged.addListener((changes, namespace) => {
//     for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//         console.log(
//             `Storage key "${key}" in namespace "${namespace}" changed.`,
//             `Old value was "${JSON.stringify(oldValue)}", new value is "${JSON.stringify(newValue)}".`
//         );
//     }
// });