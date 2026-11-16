export const QUIZ_DATA = {
  'bubble-sort': [
    {
      id: 'bs-1',
      question: 'What is the worst-case time complexity of Bubble Sort?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'],
      correct: 2,
      explanation:
        'Bubble Sort has O(n²) worst-case time complexity because it uses two nested loops. In the worst case (reverse-sorted array), every pair of adjacent elements must be swapped, resulting in roughly n*(n-1)/2 comparisons and swaps.',
    },
    {
      id: 'bs-2',
      question:
        'What is the best-case time complexity of Bubble Sort with the early-termination optimization?',
      options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
      correct: 1,
      explanation:
        'With the optimization that stops early if no swaps occur during a pass, Bubble Sort achieves O(n) best-case complexity on an already-sorted array. A single pass with zero swaps confirms the array is sorted.',
    },
    {
      id: 'bs-3',
      question: 'Is Bubble Sort a stable sorting algorithm?',
      options: [
        'No, it never preserves relative order',
        'Yes, equal elements retain their original relative order',
        'Only when the input is already sorted',
        'Only for numeric data',
      ],
      correct: 1,
      explanation:
        'Bubble Sort is stable because it only swaps adjacent elements when the left one is strictly greater than the right one. Equal elements are never swapped past each other, so their original relative order is preserved.',
    },
    {
      id: 'bs-4',
      question:
        'After the first complete pass of Bubble Sort on the array [5, 3, 8, 1, 2], which element is guaranteed to be in its final position?',
      options: ['5', '3', '8', '1'],
      correct: 2,
      explanation:
        'After each pass of Bubble Sort, the largest unsorted element "bubbles up" to its correct position at the end of the unsorted portion. After the first pass, 8 (the largest element) is guaranteed to be in its final position at the end of the array.',
    },
    {
      id: 'bs-5',
      question: 'What is the space complexity of Bubble Sort?',
      options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
      correct: 3,
      explanation:
        'Bubble Sort is an in-place sorting algorithm that only needs a constant amount of extra memory — a temporary variable for swapping and possibly a boolean flag for the early-termination optimization. This gives it O(1) auxiliary space complexity.',
    },
    {
      id: 'bs-6',
      question:
        'Why is Bubble Sort generally considered impractical for large datasets, even though it has the same worst-case complexity as Selection Sort and Insertion Sort?',
      options: [
        'It uses more memory than the other two',
        'It performs far more swaps on average than Selection Sort and lacks Insertion Sort\'s advantage on nearly-sorted data',
        'It is not a comparison-based sort',
        'It cannot sort strings, only numbers',
      ],
      correct: 1,
      explanation:
        'Bubble Sort tends to perform many more swaps than Selection Sort (which does at most n swaps) and does not benefit as naturally from partially sorted input as Insertion Sort does. While all three are O(n²) worst-case, Bubble Sort\'s constant factors make it the slowest in practice for most inputs.',
    },
  ],

  'selection-sort': [
    {
      id: 'ss-1',
      question: 'How does Selection Sort work?',
      options: [
        'It repeatedly merges sorted subarrays',
        'It repeatedly finds the minimum element from the unsorted portion and places it at the beginning',
        'It inserts each element into its correct position one at a time',
        'It partitions the array around a pivot element',
      ],
      correct: 1,
      explanation:
        'Selection Sort works by dividing the array into a sorted and an unsorted region. It repeatedly scans the unsorted region to find the minimum element and swaps it with the first unsorted element, growing the sorted region by one each iteration.',
    },
    {
      id: 'ss-2',
      question:
        'What is the time complexity of Selection Sort in all cases (best, average, worst)?',
      options: [
        'O(n) best, O(n²) average and worst',
        'O(n²) in all cases',
        'O(n log n) in all cases',
        'O(n²) best and average, O(n³) worst',
      ],
      correct: 1,
      explanation:
        'Selection Sort always performs the same number of comparisons regardless of the initial order of elements. It must scan the entire unsorted portion to find the minimum each time, resulting in n*(n-1)/2 comparisons — O(n²) — in every case.',
    },
    {
      id: 'ss-3',
      question: 'Is Selection Sort a stable sorting algorithm?',
      options: [
        'Yes, it always preserves relative order of equal elements',
        'No, the long-range swaps can change the relative order of equal elements',
        'Yes, but only for integer arrays',
        'It depends on the implementation language',
      ],
      correct: 1,
      explanation:
        'The standard implementation of Selection Sort is not stable. When it swaps the minimum element with the first unsorted element, it can jump an equal element over another, changing their relative order. For example, sorting [2a, 2b, 1] results in [1, 2b, 2a].',
    },
    {
      id: 'ss-4',
      question:
        'What is the maximum number of swaps Selection Sort performs on an array of n elements?',
      options: ['n²', 'n*(n-1)/2', 'n-1', 'n'],
      correct: 2,
      explanation:
        'Selection Sort performs at most n-1 swaps — one swap per pass through the unsorted region. This is a significant advantage over Bubble Sort when swap operations are expensive, since the number of swaps is always O(n) regardless of input.',
    },
    {
      id: 'ss-5',
      question:
        'When might Selection Sort be preferred over more efficient algorithms like Merge Sort?',
      options: [
        'When the dataset is extremely large',
        'When memory writes are very expensive and auxiliary space must be minimized',
        'When the data is nearly sorted',
        'When a stable sort is required',
      ],
      correct: 1,
      explanation:
        'Selection Sort minimizes the number of swaps (at most n-1) and uses O(1) auxiliary space. In environments where writing to memory is much more costly than reading (e.g., flash memory or EEPROM), Selection Sort can outperform algorithms that do more writes, even if they have better time complexity.',
    },
  ],

  'insertion-sort': [
    {
      id: 'is-1',
      question: 'What is the best-case time complexity of Insertion Sort?',
      options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
      correct: 1,
      explanation:
        'When the array is already sorted, Insertion Sort only makes one comparison per element (finding that it is already in the right place) and performs no shifts. This results in O(n) time, making it very efficient for nearly sorted data.',
    },
    {
      id: 'is-2',
      question: 'How does Insertion Sort process each element?',
      options: [
        'It finds the global minimum and places it at the front',
        'It picks the next unsorted element and inserts it into its correct position within the already-sorted portion',
        'It compares and swaps adjacent elements repeatedly',
        'It divides the array in half and sorts each half recursively',
      ],
      correct: 1,
      explanation:
        'Insertion Sort maintains a sorted subarray at the left. For each new element, it shifts larger sorted elements to the right until it finds the correct insertion point, then places the element there — much like sorting a hand of playing cards.',
    },
    {
      id: 'is-3',
      question: 'Is Insertion Sort stable?',
      options: [
        'No, it swaps non-adjacent elements',
        'Yes, equal elements maintain their original relative order',
        'Only if the comparisons use <= instead of <',
        'Stability is not applicable to Insertion Sort',
      ],
      correct: 1,
      explanation:
        'Insertion Sort is stable because it only shifts elements that are strictly greater than the element being inserted. Equal elements are never moved past each other, preserving their original relative order.',
    },
    {
      id: 'is-4',
      question:
        'For small arrays (e.g., fewer than 10-20 elements), which statement is true?',
      options: [
        'Merge Sort is always faster than Insertion Sort',
        'Insertion Sort often outperforms O(n log n) algorithms due to low overhead',
        'Quick Sort is always the best choice regardless of array size',
        'Insertion Sort and Merge Sort perform identically',
      ],
      correct: 1,
      explanation:
        'For small arrays, the overhead of recursion and extra memory allocation in algorithms like Merge Sort and Quick Sort outweighs their asymptotic advantage. Insertion Sort has very low constant factors and excellent cache behavior, which is why many real-world sorting implementations (like Timsort) switch to Insertion Sort for small subarrays.',
    },
    {
      id: 'is-5',
      question:
        'What is the worst-case input for Insertion Sort, and how many comparisons does it make on that input?',
      options: [
        'An already-sorted array; n comparisons',
        'A reverse-sorted array; n*(n-1)/2 comparisons',
        'A randomly shuffled array; n*log(n) comparisons',
        'An array with all identical elements; n² comparisons',
      ],
      correct: 1,
      explanation:
        'The worst case for Insertion Sort is a reverse-sorted array. Each new element must be compared against every element in the sorted portion and shifted all the way to the front. This produces 1+2+3+...+(n-1) = n*(n-1)/2 comparisons, which is O(n²).',
    },
  ],

  'merge-sort': [
    {
      id: 'ms-1',
      question: 'What is the time complexity of Merge Sort in all cases?',
      options: [
        'O(n²) in all cases',
        'O(n log n) in all cases',
        'O(n) best, O(n log n) average and worst',
        'O(n log n) best, O(n²) worst',
      ],
      correct: 1,
      explanation:
        'Merge Sort always divides the array in half (log n levels of recursion) and merges all elements at each level (O(n) work per level). This gives a guaranteed O(n log n) time complexity regardless of the input order, making it more predictable than Quick Sort.',
    },
    {
      id: 'ms-2',
      question: 'What is the space complexity of standard Merge Sort?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correct: 2,
      explanation:
        'Standard Merge Sort requires O(n) auxiliary space for the temporary arrays used during the merge step. This is its main disadvantage compared to in-place algorithms like Quick Sort. The recursion stack adds O(log n), but the dominant term is the O(n) merge buffer.',
    },
    {
      id: 'ms-3',
      question: 'Is Merge Sort a stable sorting algorithm?',
      options: [
        'No, the merge step can reorder equal elements',
        'Yes, as long as the merge step picks from the left subarray first when elements are equal',
        'Only for arrays, not for linked lists',
        'Stability depends on the programming language',
      ],
      correct: 1,
      explanation:
        'Merge Sort is stable when implemented correctly. During the merge step, if elements from the left and right subarrays are equal, choosing the one from the left subarray first ensures that the original relative order of equal elements is preserved.',
    },
    {
      id: 'ms-4',
      question:
        'Which data structure allows Merge Sort to be implemented with O(1) auxiliary space?',
      options: ['Array', 'Binary tree', 'Linked list', 'Hash table'],
      correct: 2,
      explanation:
        'With linked lists, the merge step can be done by re-linking node pointers rather than copying elements to a temporary array. This eliminates the need for O(n) extra space. The split step can use the slow/fast pointer technique to find the midpoint in O(n) time.',
    },
    {
      id: 'ms-5',
      question: 'What paradigm does Merge Sort use?',
      options: [
        'Greedy algorithm',
        'Dynamic programming',
        'Divide and conquer',
        'Backtracking',
      ],
      correct: 2,
      explanation:
        'Merge Sort is a classic divide-and-conquer algorithm. It divides the problem into two halves (divide), recursively sorts each half (conquer), and then merges the sorted halves back together (combine).',
    },
    {
      id: 'ms-6',
      question:
        'Why is Merge Sort generally preferred over Quick Sort for sorting linked lists?',
      options: [
        'Merge Sort has better time complexity on linked lists',
        'Quick Sort cannot work on linked lists at all',
        'Merge Sort avoids the O(n) extra space disadvantage (linked list merge is in-place) and does not need random access, which linked lists lack',
        'Merge Sort uses fewer comparisons on linked lists',
      ],
      correct: 2,
      explanation:
        'Quick Sort relies on efficient random access for its partition step, which linked lists do not provide. Merge Sort, on the other hand, only needs sequential access and can merge linked lists in-place by relinking pointers, eliminating its usual O(n) space overhead. This makes Merge Sort the natural choice for linked lists.',
    },
  ],

  'quick-sort': [
    {
      id: 'qs-1',
      question: 'What is the average-case time complexity of Quick Sort?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      correct: 1,
      explanation:
        'On average, Quick Sort\'s pivot divides the array into two roughly equal halves, giving log n levels of recursion with O(n) work at each level. This yields O(n log n) average-case performance, which is optimal for comparison-based sorting.',
    },
    {
      id: 'qs-2',
      question:
        'What is the worst-case time complexity of Quick Sort, and when does it occur?',
      options: [
        'O(n log n), when the array is random',
        'O(n²), when the pivot is always the smallest or largest element',
        'O(n²), when all elements are distinct',
        'O(n), when the array is already sorted',
      ],
      correct: 1,
      explanation:
        'The worst case O(n²) occurs when the pivot is consistently the minimum or maximum element, creating one partition of size n-1 and another of size 0. This happens with a naive first/last-element pivot on already sorted or reverse-sorted arrays. Techniques like median-of-three or random pivot selection mitigate this.',
    },
    {
      id: 'qs-3',
      question: 'Is the standard Quick Sort algorithm stable?',
      options: [
        'Yes, it preserves relative order of equal elements',
        'No, the partition step can change the relative order of equal elements',
        'Yes, but only with the Lomuto partition scheme',
        'Stability does not apply to Quick Sort',
      ],
      correct: 1,
      explanation:
        'Standard Quick Sort (both Lomuto and Hoare partition schemes) is not stable. During partitioning, elements can be swapped across long distances, which can change the relative order of equal elements. A stable variant is possible but requires extra space.',
    },
    {
      id: 'qs-4',
      question: 'What is the space complexity of Quick Sort?',
      options: [
        'O(n) in all cases',
        'O(1) — it is fully in-place',
        'O(log n) average due to recursion stack, O(n) worst case',
        'O(n log n)',
      ],
      correct: 2,
      explanation:
        'Quick Sort is in-place (no auxiliary array), but it uses stack space for recursion. With good pivot selection and tail-call optimization, the stack depth is O(log n) on average. In the worst case (unbalanced partitions), the stack depth can grow to O(n).',
    },
    {
      id: 'qs-5',
      question:
        'Which pivot selection strategy helps avoid Quick Sort\'s worst-case behavior?',
      options: [
        'Always pick the first element',
        'Always pick the last element',
        'Pick the median of the first, middle, and last elements',
        'Always pick the second element',
      ],
      correct: 2,
      explanation:
        'The median-of-three strategy picks the median of the first, middle, and last elements as the pivot. This avoids the worst case on already-sorted or reverse-sorted input and generally produces more balanced partitions than picking a fixed position, while adding only O(1) overhead per partition.',
    },
    {
      id: 'qs-6',
      question:
        'Why is Quick Sort often faster in practice than Merge Sort, despite having a worse worst case?',
      options: [
        'Quick Sort has better asymptotic complexity',
        'Quick Sort uses less memory and has better cache locality since it sorts in-place',
        'Quick Sort makes fewer comparisons in all cases',
        'Merge Sort cannot sort primitive types',
      ],
      correct: 1,
      explanation:
        'Quick Sort operates in-place on a contiguous array, which means it has excellent cache locality — elements being compared and swapped are near each other in memory. Merge Sort requires copying elements to auxiliary arrays, causing more cache misses. Quick Sort also avoids the overhead of allocating and freeing temporary arrays.',
    },
  ],

  'linear-search': [
    {
      id: 'ls-1',
      question: 'What is the time complexity of Linear Search?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correct: 2,
      explanation:
        'Linear Search checks each element one by one from the beginning until it finds the target or reaches the end. In the worst case, it must examine all n elements, giving O(n) time complexity.',
    },
    {
      id: 'ls-2',
      question: 'Does Linear Search require the input to be sorted?',
      options: [
        'Yes, it only works on sorted arrays',
        'No, it works on any collection regardless of order',
        'It requires partial sorting',
        'Only for numeric data',
      ],
      correct: 1,
      explanation:
        'Linear Search makes no assumptions about the order of elements. It simply scans each element sequentially, so it works on unsorted data, linked lists, or any iterable collection. This is its key advantage over Binary Search.',
    },
    {
      id: 'ls-3',
      question:
        'What is the best-case time complexity of Linear Search?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n/2)'],
      correct: 0,
      explanation:
        'The best case occurs when the target element is the very first element in the collection. Linear Search finds it immediately in one comparison, giving O(1) time.',
    },
    {
      id: 'ls-4',
      question:
        'When is Linear Search a better choice than Binary Search?',
      options: [
        'When the dataset is very large and sorted',
        'When the data is unsorted or stored in a linked list',
        'When you need to find all occurrences',
        'Linear Search is never a better choice',
      ],
      correct: 1,
      explanation:
        'Linear Search is the right choice when data is unsorted (Binary Search requires sorted data) or when data is in a linked list (Binary Search needs O(1) random access). Sorting first just to use Binary Search costs O(n log n), which is worse than one O(n) linear scan for a single query.',
    },
    {
      id: 'ls-5',
      question:
        'What is the sentinel linear search optimization?',
      options: [
        'Searching from both ends simultaneously',
        'Placing the target at the end of the array to eliminate the bounds-check in each iteration',
        'Skipping every other element',
        'Using a hash table to speed up the search',
      ],
      correct: 1,
      explanation:
        'Sentinel linear search places the search target at the last position of the array (saving the original value). This guarantees the loop will find the target, eliminating the need for a separate end-of-array bounds check on every iteration. After the loop, you check whether the found index is the sentinel or a genuine match. This roughly halves the number of comparisons per iteration.',
    },
  ],

  'binary-search': [
    {
      id: 'bns-1',
      question: 'What is the time complexity of Binary Search?',
      options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
      correct: 2,
      explanation:
        'Binary Search halves the search space with each comparison. Starting with n elements, after one comparison you have n/2, then n/4, and so on. It takes at most log₂(n) steps to reduce the search space to one element, giving O(log n) time complexity.',
    },
    {
      id: 'bns-2',
      question: 'What prerequisite must the data satisfy for Binary Search to work?',
      options: [
        'Elements must be unique',
        'Elements must be sorted',
        'The array must have an even number of elements',
        'Elements must be integers',
      ],
      correct: 1,
      explanation:
        'Binary Search relies on the data being sorted so that it can determine which half of the array to discard after each comparison. Without sorted order, the decision to go left or right would be meaningless, and the algorithm would fail to find elements correctly.',
    },
    {
      id: 'bns-3',
      question:
        'In Binary Search, how should the midpoint be calculated to avoid integer overflow?',
      options: [
        'mid = (low + high) / 2',
        'mid = low + (high - low) / 2',
        'mid = high - low / 2',
        'mid = (low * high) / 2',
      ],
      correct: 1,
      explanation:
        'The expression (low + high) can overflow if both are large integers. Using low + (high - low) / 2 avoids this by computing the difference first, which is always non-negative and smaller than either value. This is a well-known best practice in production code.',
    },
    {
      id: 'bns-4',
      question:
        'How many comparisons does Binary Search need at most to find an element in a sorted array of 1,000,000 elements?',
      options: ['About 10', 'About 20', 'About 100', 'About 1000'],
      correct: 1,
      explanation:
        'Binary Search needs at most ceil(log₂(1,000,000)) comparisons. Since 2²⁰ = 1,048,576, it takes at most 20 comparisons to search through one million elements. This dramatic efficiency is why Binary Search is so powerful for large sorted datasets.',
    },
    {
      id: 'bns-5',
      question: 'What is the space complexity of iterative Binary Search?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
      correct: 2,
      explanation:
        'Iterative Binary Search uses only a constant number of variables (low, high, mid) regardless of input size, giving O(1) space complexity. The recursive version uses O(log n) space for the call stack.',
    },
    {
      id: 'bns-6',
      question:
        'Binary Search can be adapted beyond simple lookup. Which of the following is NOT a common Binary Search variation?',
      options: [
        'Finding the first occurrence of a target in a sorted array with duplicates',
        'Finding the insertion point for a target to maintain sorted order',
        'Searching for a target in an unsorted array by using random pivot points',
        'Finding the minimum in a rotated sorted array',
      ],
      correct: 2,
      explanation:
        'Binary Search can find first/last occurrences, insertion points (lower/upper bound), and work on rotated sorted arrays — all by adjusting the condition and pointer movement. However, it cannot search an unsorted array because the sorted-order invariant is essential for correctly discarding half the search space.',
    },
  ],

  'maze-solver': [
    {
      id: 'mz-1',
      question:
        'Which algorithm is commonly used to solve a maze by exploring as far as possible along each path before backtracking?',
      options: [
        'Breadth-First Search (BFS)',
        'Depth-First Search (DFS)',
        'Dijkstra\'s Algorithm',
        'A* Search',
      ],
      correct: 1,
      explanation:
        'Depth-First Search explores as far as possible along each branch before backtracking. In a maze, DFS follows a path until it hits a dead end, then backtracks to try the next unexplored direction. This is the classic approach for maze solving and maps naturally to recursion or an explicit stack.',
    },
    {
      id: 'mz-2',
      question:
        'Which algorithm guarantees finding the shortest path in an unweighted maze?',
      options: [
        'Depth-First Search',
        'Breadth-First Search',
        'Random Walk',
        'Greedy Best-First Search',
      ],
      correct: 1,
      explanation:
        'BFS explores all cells at distance d before any cell at distance d+1. In an unweighted maze (where each step has equal cost), this guarantees that the first time BFS reaches the goal, it has found the shortest path. DFS may find a path, but not necessarily the shortest one.',
    },
    {
      id: 'mz-3',
      question:
        'What data structure does a backtracking maze solver implicitly or explicitly use?',
      options: ['Queue', 'Stack', 'Heap', 'Hash table'],
      correct: 1,
      explanation:
        'Backtracking uses a stack (explicitly, or implicitly via the call stack in recursion). When you hit a dead end, you pop the last decision off the stack and try the next alternative. This last-in-first-out behavior is exactly what a stack provides.',
    },
    {
      id: 'mz-4',
      question:
        'What is the time complexity of solving a maze with r rows and c columns using BFS or DFS?',
      options: ['O(r + c)', 'O(r * c)', 'O((r * c)²)', 'O(2^(r*c))'],
      correct: 1,
      explanation:
        'Both BFS and DFS visit each cell at most once and examine a constant number of neighbors (up to 4 in a grid). With r*c total cells, the time complexity is O(r * c). This is linear in the size of the maze.',
    },
    {
      id: 'mz-5',
      question:
        'In a maze solver, why is it important to mark cells as visited?',
      options: [
        'To make the maze look different when displayed',
        'To prevent infinite loops by not revisiting cells already explored',
        'To count the total number of cells in the maze',
        'Visited markers are optional and only improve aesthetics',
      ],
      correct: 1,
      explanation:
        'Without marking visited cells, the algorithm could revisit the same cells indefinitely, creating infinite loops (especially with DFS) or processing the same cell multiple times (wasting time with BFS). Marking cells as visited ensures each cell is processed at most once, guaranteeing termination and efficiency.',
    },
  ],

  'n-queens': [
    {
      id: 'nq-1',
      question: 'What is the N-Queens problem?',
      options: [
        'Place n queens on an n x n chessboard so that every row has exactly 2 queens',
        'Place n queens on an n x n chessboard so that no two queens threaten each other',
        'Find the shortest path for a queen across an n x n chessboard',
        'Determine how many squares a queen can attack on an n x n board',
      ],
      correct: 1,
      explanation:
        'The N-Queens problem asks you to place n queens on an n x n chessboard such that no two queens share the same row, column, or diagonal. Since queens can attack horizontally, vertically, and diagonally, this constraint makes the problem challenging.',
    },
    {
      id: 'nq-2',
      question:
        'Which algorithmic technique is most commonly used to solve the N-Queens problem?',
      options: [
        'Dynamic programming',
        'Greedy algorithm',
        'Backtracking',
        'Divide and conquer',
      ],
      correct: 2,
      explanation:
        'Backtracking is the standard approach for N-Queens. You place queens one row at a time, and if placing a queen in a column leads to a conflict, you backtrack by removing it and trying the next column. This systematically explores valid configurations while pruning invalid branches early.',
    },
    {
      id: 'nq-3',
      question:
        'For the 8-Queens problem, how many distinct solutions exist?',
      options: ['12', '42', '92', '724'],
      correct: 2,
      explanation:
        'The 8-Queens problem has 92 distinct solutions. If we consider rotations and reflections as equivalent, there are 12 fundamentally different solutions. The full 92 count includes all rotational and reflective variants.',
    },
    {
      id: 'nq-4',
      question:
        'In a typical backtracking solution, how do you efficiently check if a queen placement is safe?',
      options: [
        'Scan the entire board each time to check for conflicts',
        'Track which columns and diagonals are occupied using sets or boolean arrays',
        'Place all queens first, then validate the board',
        'Use a random placement and retry if invalid',
      ],
      correct: 1,
      explanation:
        'Efficient implementations maintain sets (or boolean arrays) for occupied columns, main diagonals (row - col), and anti-diagonals (row + col). Checking safety becomes an O(1) lookup instead of scanning the board. Since queens are placed one per row, row conflicts are impossible by construction.',
    },
    {
      id: 'nq-5',
      question:
        'What is the worst-case time complexity of a backtracking solution to the N-Queens problem?',
      options: ['O(n²)', 'O(n!)', 'O(2^n)', 'O(n^n)'],
      correct: 1,
      explanation:
        'In the worst case, the first row has n choices, the second row has at most n-1 (since one column is taken), the third has at most n-2, and so on. This gives an upper bound of O(n!). In practice, diagonal constraints prune many branches, so the actual number of nodes explored is much smaller than n!.',
    },
  ],

  'knights-tour': [
    {
      id: 'kt-1',
      question: 'What is the Knight\'s Tour problem?',
      options: [
        'Find the shortest path for a knight between two squares',
        'Find a sequence of moves so the knight visits every square on the board exactly once',
        'Determine how many squares a knight can reach in n moves',
        'Place the maximum number of knights on a board with no conflicts',
      ],
      correct: 1,
      explanation:
        'The Knight\'s Tour problem asks whether a knight can visit every square on an n x n chessboard exactly once, starting from a given position. A closed tour returns to the starting square; an open tour ends on a different square.',
    },
    {
      id: 'kt-2',
      question: 'How many possible moves does a knight have from a square in the center of the board?',
      options: ['4', '6', '8', '12'],
      correct: 2,
      explanation:
        'A knight moves in an L-shape: two squares in one direction and one square perpendicular (or vice versa). From a central square with no edge constraints, this gives 8 possible destination squares. Near the edges or corners, some of these moves fall off the board.',
    },
    {
      id: 'kt-3',
      question:
        'What is Warnsdorff\'s rule, and why is it useful for the Knight\'s Tour?',
      options: [
        'Always move to the square closest to the center of the board',
        'Always move to the square with the fewest onward moves (minimum degree)',
        'Always move to the square with the most onward moves',
        'Always move in a clockwise spiral pattern',
      ],
      correct: 1,
      explanation:
        'Warnsdorff\'s rule is a greedy heuristic that chooses the next square with the fewest remaining valid moves. The intuition is to visit hard-to-reach squares early, before they become unreachable. This heuristic finds a solution in linear time for most board sizes without full backtracking, though it does not guarantee success for all starting positions.',
    },
    {
      id: 'kt-4',
      question:
        'What algorithmic approach does a brute-force Knight\'s Tour solution use?',
      options: [
        'Dynamic programming',
        'Backtracking (depth-first search with undo)',
        'Breadth-first search',
        'Greedy selection without backtracking',
      ],
      correct: 1,
      explanation:
        'A brute-force solution uses backtracking: try a move, recurse to continue the tour, and if you reach a dead end (no unvisited squares reachable but the tour is incomplete), undo the last move and try the next option. This is essentially DFS over the space of move sequences.',
    },
    {
      id: 'kt-5',
      question:
        'On a standard 8x8 chessboard, approximately how many open knight\'s tours exist?',
      options: [
        'About 92',
        'About 26 million',
        'About 26 trillion (2.6 x 10^13)',
        'Exactly 64',
      ],
      correct: 2,
      explanation:
        'There are approximately 26.5 trillion (26,534,728,821,064) open knight\'s tours on an 8x8 board. This enormous number illustrates why exhaustive enumeration is infeasible and why heuristics like Warnsdorff\'s rule are essential for finding individual solutions efficiently.',
    },
  ],

  'sudoku-solver': [
    {
      id: 'su-1',
      question: 'Which technique is most commonly used to solve Sudoku programmatically?',
      options: [
        'Greedy fill with random guessing',
        'Backtracking with constraint checking',
        'Dynamic programming',
        'Divide and conquer',
      ],
      correct: 1,
      explanation:
        'Backtracking with constraint checking is the standard approach. The solver finds an empty cell, tries digits 1-9, checks if each digit is valid (not already in the same row, column, or 3x3 box), and recurses. If no digit works, it backtracks to the previous cell and tries the next option.',
    },
    {
      id: 'su-2',
      question: 'What are the three constraints that every valid Sudoku solution must satisfy?',
      options: [
        'Each row, column, and 3x3 box contains all digits 1-9 exactly once',
        'Each row, column, and diagonal contains all digits 1-9 exactly once',
        'Each row and column contains all digits 1-9; boxes are optional',
        'Each row contains 1-9, columns contain 1-9, and the sum of each box is 45',
      ],
      correct: 0,
      explanation:
        'A valid Sudoku solution requires that each of the 9 rows, 9 columns, and 9 non-overlapping 3x3 boxes contains every digit from 1 to 9 exactly once. Diagonals are not constrained in standard Sudoku (though they are in diagonal Sudoku variants).',
    },
    {
      id: 'su-3',
      question:
        'What is the worst-case time complexity of a backtracking Sudoku solver?',
      options: ['O(n²)', 'O(n⁴)', 'O(9^m) where m is the number of empty cells', 'O(n!)'],
      correct: 2,
      explanation:
        'In the worst case, each empty cell could try all 9 digits, and there are m empty cells. This gives a theoretical upper bound of O(9^m). In practice, constraint propagation and pruning drastically reduce the search space, and most well-posed Sudoku puzzles are solved very quickly.',
    },
    {
      id: 'su-4',
      question:
        'How can you efficiently check if placing a digit in a cell is valid?',
      options: [
        'Scan the entire 9x9 grid for conflicts',
        'Maintain sets for each row, column, and box tracking which digits are already placed',
        'Only check the row; column and box conflicts are rare',
        'Try placing the digit and check the final solution',
      ],
      correct: 1,
      explanation:
        'By maintaining a set (or bitmask) for each row, column, and 3x3 box indicating which digits are present, you can check validity in O(1) time. The box index for cell (r, c) is typically computed as 3*(r/3) + (c/3). This avoids repeatedly scanning rows, columns, and boxes.',
    },
    {
      id: 'su-5',
      question:
        'What is constraint propagation, and how does it improve Sudoku solving?',
      options: [
        'Randomly assigning values and checking if they work',
        'Eliminating impossible values from cells based on existing placements, reducing the search space before backtracking',
        'Solving the puzzle from the bottom-right corner instead of the top-left',
        'Adding extra constraints to make the puzzle harder',
      ],
      correct: 1,
      explanation:
        'Constraint propagation iteratively removes impossible digit candidates from cells. For example, if a cell\'s row already contains 3 and 7, those are eliminated as candidates for that cell. Techniques like naked singles (cell with one candidate) and hidden singles (digit with one possible position in a unit) can fill many cells without backtracking, dramatically reducing the search space.',
    },
  ],

  'graph-bfs': [
    {
      id: 'gb-1',
      question:
        'What data structure does Breadth-First Search use to manage the frontier of nodes to visit?',
      options: ['Stack', 'Queue', 'Priority queue', 'Linked list'],
      correct: 1,
      explanation:
        'BFS uses a queue (FIFO — first-in, first-out) to process nodes in the order they are discovered. This ensures that all nodes at distance d from the source are visited before any node at distance d+1, which is what gives BFS its level-by-level exploration behavior.',
    },
    {
      id: 'gb-2',
      question:
        'What is the time complexity of BFS on a graph with V vertices and E edges?',
      options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V * E)'],
      correct: 2,
      explanation:
        'BFS visits each vertex at most once (O(V)) and examines each edge at most once when checking neighbors (O(E) total across all vertices). Combined, this gives O(V + E) time complexity, which is linear in the size of the graph.',
    },
    {
      id: 'gb-3',
      question:
        'BFS guarantees the shortest path in which type of graph?',
      options: [
        'Weighted graphs with positive weights',
        'Unweighted graphs (or graphs where all edge weights are equal)',
        'Graphs with negative edge weights',
        'Only directed acyclic graphs',
      ],
      correct: 1,
      explanation:
        'BFS finds the shortest path in terms of the number of edges (hops). This is equivalent to the shortest path when all edges have equal weight (or the graph is unweighted). For weighted graphs with varying edge weights, Dijkstra\'s algorithm or Bellman-Ford should be used instead.',
    },
    {
      id: 'gb-4',
      question: 'What is the space complexity of BFS?',
      options: ['O(1)', 'O(log V)', 'O(V)', 'O(V + E)'],
      correct: 2,
      explanation:
        'BFS must store all discovered nodes in the queue and the visited set. In the worst case (e.g., a star graph), the queue can hold up to V-1 nodes at once, and the visited set grows to V. This gives O(V) space complexity. This is BFS\'s main disadvantage compared to DFS for very large graphs.',
    },
    {
      id: 'gb-5',
      question:
        'Which of the following is NOT a common application of BFS?',
      options: [
        'Finding the shortest path in an unweighted graph',
        'Level-order traversal of a tree',
        'Finding strongly connected components in a directed graph',
        'Checking if a graph is bipartite',
      ],
      correct: 2,
      explanation:
        'Finding strongly connected components (SCCs) is typically done using Tarjan\'s algorithm or Kosaraju\'s algorithm, both of which rely on DFS, not BFS. In contrast, BFS is ideal for shortest paths in unweighted graphs, level-order tree traversal, and bipartiteness checking (by 2-coloring nodes level by level).',
    },
  ],
};
