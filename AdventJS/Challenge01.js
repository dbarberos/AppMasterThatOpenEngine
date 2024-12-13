function prepareGifts(gifts) {

    const newList = []
    gifts.forEach((gift) => {
        if (!newList.includes(gift)) {
            newList.push(gift)
        }
    })
    const orderList = newList.sort((a, b) => a - b)

    return orderList
}

const gifts1 = [3, 1, 2, 3, 4, 2, 5]
const preparedGifts1 = prepareGifts(gifts1)
console.log(preparedGifts1) // [1, 2, 3, 4, 5]

const gifts2 = [6, 5, 5, 5, 5]
const preparedGifts2 = prepareGifts(gifts2)
console.log(preparedGifts2) // [5, 6]

const gifts3 = []
const preparedGifts3 = prepareGifts(gifts3)
console.log(preparedGifts3) // []
// There are no gifts, the list remains empty


/*
Sorting Behavior: The sort() method sorts the elements as strings by default. Since your input consists of numbers, it will work correctly in this case. However, if you want to ensure numerical sorting, you can provide a compare function to the sort() method:

javascript

Verify

Open In Editor
Edit
Copy code
const orderList = newList.sort((a, b) => a - b);
Performance Consideration: Using includes in a loop can lead to performance issues for large arrays since it has to scan the newList for each gift. If performance becomes a concern, consider using a Set to store unique gifts:

javascript

Verify

Open In Editor
Edit
Copy code
function prepareGifts(gifts) {
    const uniqueGifts = new Set(gifts);
    return Array.from(uniqueGifts).sort((a, b) => a - b);
}
This alternative approach using a Set is more efficient for larger datasets and simplifies the code. Overall, your original function works well for the provided test cases!
*/
