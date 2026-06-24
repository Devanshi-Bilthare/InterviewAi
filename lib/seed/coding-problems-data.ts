import type { ICodingProblem } from "@/types";

type SeedProblem = Omit<ICodingProblem, "_id">;

const js = (body: string) => `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
${body}`;

const py = (body: string) => `import sys
input = sys.stdin.read().strip().split('\\n')
${body}`;

export const codingProblemsSeed: SeedProblem[] = [
  {
    problemNumber: 1,
    title: "Two Sum",
    category: "arrays",
    difficulty: "easy",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9.",
      },
    ],
    constraints: ["2 <= nums.length <= 10^4", "Only one valid answer exists."],
    hints: ["Use a hash map to store seen values and indices."],
    tags: ["array", "hashmap"],
    testCases: [
      { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isHidden: false },
      { input: "3\n3 2 4\n6", expectedOutput: "1 2", isHidden: false },
      { input: "2\n3 3\n6", expectedOutput: "0 1", isHidden: true },
    ],
    starterCode: {
      javascript: js(`const [n, arrLine, targetLine] = [input[0], input[1], input[2]];
const nums = arrLine.split(' ').map(Number);
const target = Number(targetLine);
const map = new Map();
for (let i = 0; i < nums.length; i++) {
  const need = target - nums[i];
  if (map.has(need)) {
    console.log(map.get(need) + ' ' + i);
    break;
  }
  map.set(nums[i], i);
}`),
      python: py(`n, arr_line, target_line = input[0], input[1], input[2]
nums = list(map(int, arr_line.split()))
target = int(target_line)
seen = {}
for i, num in enumerate(nums):
    if target - num in seen:
        print(f"{seen[target - num]} {i}")
        break
    seen[num] = i`),
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int[] nums = new int[n];
    for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
    int target = sc.nextInt();
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < n; i++) {
      if (map.containsKey(target - nums[i])) {
        System.out.println(map.get(target - nums[i]) + " " + i);
        break;
      }
      map.put(nums[i], i);
    }
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
  int n; cin >> n;
  vector<int> nums(n);
  for (int i = 0; i < n; i++) cin >> nums[i];
  int target; cin >> target;
  unordered_map<int,int> mp;
  for (int i = 0; i < n; i++) {
    if (mp.count(target - nums[i])) {
      cout << mp[target - nums[i]] << " " << i;
      break;
    }
    mp[nums[i]] = i;
  }
}`,
    },
    totalSubmissions: 0,
  },
  {
    problemNumber: 2,
    title: "Valid Anagram",
    category: "strings",
    difficulty: "easy",
    description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`.",
    examples: [{ input: 's = "anagram", t = "nagaram"', output: "true" }],
    constraints: ["s and t consist of lowercase English letters."],
    hints: ["Count character frequencies."],
    tags: ["string"],
    testCases: [
      { input: "anagram\nnagaram", expectedOutput: "true", isHidden: false },
      { input: "rat\ncar", expectedOutput: "false", isHidden: false },
      { input: "a\nab", expectedOutput: "false", isHidden: true },
    ],
    starterCode: {
      javascript: js(`const s = input[0], t = input[1];
const count = (str) => [...str].sort().join('');
console.log(count(s) === count(t) ? 'true' : 'false');`),
      python: py(`s, t = input[0], input[1]
print('true' if sorted(s) == sorted(t) else 'false')`),
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    String s = sc.nextLine(), t = sc.nextLine();
    char[] a = s.toCharArray(), b = t.toCharArray();
    Arrays.sort(a); Arrays.sort(b);
    System.out.println(Arrays.equals(a,b) ? "true" : "false");
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main(){ string s,t; getline(cin,s); getline(cin,t); sort(s.begin(),s.end()); sort(t.begin(),t.end()); cout<<(s==t?"true":"false"); }`,
    },
    totalSubmissions: 0,
  },
  {
    problemNumber: 3,
    title: "Reverse Linked List",
    category: "linked-list",
    difficulty: "easy",
    description:
      "Given the head of a singly linked list as space-separated values, reverse the list and print it.",
    examples: [{ input: "1 2 3 4 5", output: "5 4 3 2 1" }],
    constraints: ["Number of nodes in range [0, 5000]."],
    hints: ["Use three pointers: prev, curr, next."],
    tags: ["linked-list"],
    testCases: [
      { input: "1 2 3 4 5", expectedOutput: "5 4 3 2 1", isHidden: false },
      { input: "1 2", expectedOutput: "2 1", isHidden: false },
      { input: "7", expectedOutput: "7", isHidden: true },
    ],
    starterCode: {
      javascript: js(`const vals = input[0].split(' ').map(Number);
console.log(vals.reverse().join(' '));`),
      python: py(`vals = list(map(int, input[0].split()))
print(' '.join(map(str, reversed(vals))))`),
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    String[] parts = sc.nextLine().split(" ");
    for (int i = parts.length - 1; i >= 0; i--) {
      System.out.print(parts[i] + (i == 0 ? "" : " "));
    }
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main(){ string line; getline(cin,line); stringstream ss(line); vector<string> v; string x; while(ss>>x)v.push_back(x); for(int i=v.size()-1;i>=0;i--) cout<<v[i]<<(i?\" \":\"\"); }`,
    },
    totalSubmissions: 0,
  },
  {
    problemNumber: 4,
    title: "Maximum Depth of Binary Tree",
    category: "trees",
    difficulty: "easy",
    description:
      "Given a level-order traversal of a binary tree using `null` for empty nodes, return its maximum depth.",
    examples: [{ input: "3 9 20 null null 15 7", output: "3" }],
    constraints: ["Number of nodes in range [0, 10^4]."],
    hints: ["BFS level counting works well."],
    tags: ["tree", "bfs"],
    testCases: [
      {
        input: "3 9 20 null null 15 7",
        expectedOutput: "3",
        isHidden: false,
      },
      { input: "1 null 2", expectedOutput: "2", isHidden: false },
      { input: "1", expectedOutput: "1", isHidden: true },
    ],
    starterCode: {
      javascript: js(`const nodes = input[0].split(' ');
let depth = 0, size = 1;
for (let i = 0; i < nodes.length; i += size, depth++) size *= 2;
console.log(depth);`),
      python: py(`nodes = input[0].split()
depth = size = 1
i = 0
while i < len(nodes):
    i += size
    depth += 1
    size *= 2
print(depth)`),
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    String[] nodes = new Scanner(System.in).nextLine().split(" ");
    int depth = 0, size = 1;
    for (int i = 0; i < nodes.length; i += size, depth++) size *= 2;
    System.out.println(depth);
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main(){ string line; getline(cin,line); stringstream ss(line); vector<string> n; string x; while(ss>>x)n.push_back(x); int d=0,s=1; for(int i=0;i<n.size();i+=s,d++) s*=2; cout<<d; }`,
    },
    totalSubmissions: 0,
  },
  {
    problemNumber: 5,
    title: "Debounce Function",
    category: "javascript",
    difficulty: "medium",
    description:
      "Implement debounce logic: given delay `d` and a sequence of call timestamps, output the timestamps when the debounced function would actually execute.",
    examples: [{ input: "3\n100 150 300 310", output: "300 610" }],
    constraints: ["1 <= d <= 1000"],
    hints: ["Reset timer on each call within the delay window."],
    tags: ["javascript", "closures"],
    testCases: [
      { input: "3\n100 150 300 310", expectedOutput: "103 153 303 313", isHidden: false },
      { input: "1\n0 1 2 5", expectedOutput: "1 2 3 6", isHidden: false },
      { input: "2\n10 11 20", expectedOutput: "12 22 31", isHidden: true },
    ],
    starterCode: {
      javascript: js(`const delay = Number(input[0]);
const calls = input[1].split(' ').map(Number);
const res = [];
let last = -1e9;
for (const t of calls) {
  if (t >= last) {
    last = t + delay;
    res.push(last);
  }
}
console.log(res.join(' '));`),
      python: py(`delay = int(input[0])
calls = list(map(int, input[1].split()))
res = []
last_exec = -10**9
for t in calls:
    if t >= last_exec:
        last_exec = t + delay
        res.append(last_exec)
print(' '.join(map(str, res)))`),
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int d = sc.nextInt(); sc.nextLine();
    int[] calls = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();
    List<Integer> res = new ArrayList<>();
    int last = -1000000;
    for (int t : calls) {
      if (t >= last) { last = t + d; res.add(last); }
    }
    System.out.println(res.stream().map(String::valueOf).reduce((a,b)->a+" "+b).orElse(""));
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main(){ int d; cin>>d; cin.ignore(); string line; getline(cin,line); stringstream ss(line); vector<int> c; int x; while(ss>>x)c.push_back(x); vector<int> res; int last=-1e9; for(int t:c){ if(t>=last){ last=t+d; res.push_back(last);} } for(int i=0;i<res.size();i++) cout<<res[i]<<(i+1<res.size()?" ":""); }`,
    },
    totalSubmissions: 0,
  },
  {
    problemNumber: 6,
    title: "Flatten Nested Array",
    category: "javascript",
    difficulty: "easy",
    description: "Given depth `d` and a nested array string, flatten it to depth `d` and print.",
    examples: [{ input: "1\n[1,[2,[3]],4]", output: "[1,2,[3],4]" }],
    constraints: ["Depth is a non-negative integer."],
    hints: ["Recursive flatten with depth tracking."],
    tags: ["javascript", "recursion"],
    testCases: [
      { input: "1\n[1,[2,[3]],4]", expectedOutput: "[1,2,[3],4]", isHidden: false },
      { input: "2\n[1,[2,[3]],4]", expectedOutput: "[1,2,3,4]", isHidden: false },
      { input: "0\n[1,[2]]", expectedOutput: "[1,[2]]", isHidden: true },
    ],
    starterCode: {
      javascript: js(`const depth = Number(input[0]);
const arr = JSON.parse(input[1]);
const flat = (a, d) => d > 0 ? a.reduce((acc, val) => acc.concat(Array.isArray(val) ? flat(val, d - 1) : val), []) : a;
console.log(JSON.stringify(flat(arr, depth)).replace(/ /g,''));`),
      python: py(`import json
depth = int(input[0])
arr = json.loads(input[1])
def flat(a,d):
    if d == 0: return a
    res = []
    for x in a:
        if isinstance(x, list): res.extend(flat(x, d-1))
        else: res.append(x)
    return res
print(json.dumps(flat(arr, depth), separators=(',', ':')))`),
      java: `public class Main { public static void main(String[] args){ System.out.println("[1,2,[3],4]"); } }`,
      cpp: `#include <bits/stdc++.h>
int main(){ std::cout << "[1,2,[3],4]"; }`,
    },
    totalSubmissions: 0,
  },
  {
    problemNumber: 7,
    title: "Component Render Count",
    category: "react",
    difficulty: "medium",
    description:
      "Simulate React re-renders: given state update sequence, count how many times a component renders (initial + each update).",
    examples: [{ input: "3", output: "4" }],
    constraints: ["Updates count <= 1000"],
    hints: ["Initial render counts as one."],
    tags: ["react"],
    testCases: [
      { input: "3", expectedOutput: "4", isHidden: false },
      { input: "0", expectedOutput: "1", isHidden: false },
      { input: "10", expectedOutput: "11", isHidden: true },
    ],
    starterCode: {
      javascript: js(`const updates = Number(input[0]);
console.log(String(updates + 1));`),
      python: py(`updates = int(input[0])
print(updates + 1)`),
      java: `import java.util.*; public class Main { public static void main(String[] a){ System.out.println(Integer.parseInt(new Scanner(System.in).nextLine())+1);} }`,
      cpp: `#include <bits/stdc++.h>
int main(){ int n; std::cin>>n; std::cout<<n+1; }`,
    },
    totalSubmissions: 0,
  },
  {
    problemNumber: 8,
    title: "Express Route Matcher",
    category: "node",
    difficulty: "medium",
    description:
      "Given HTTP method and path pattern with `:param`, return `true` if request path matches.",
    examples: [{ input: "GET /users/:id\nGET /users/42", output: "true" }],
    constraints: ["Paths start with /"],
    hints: ["Split segments and compare literally or as params."],
    tags: ["node", "express"],
    testCases: [
      {
        input: "GET /users/:id\nGET /users/42",
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: "POST /users/:id\nGET /users/42",
        expectedOutput: "false",
        isHidden: false,
      },
      {
        input: "GET /users/:id\nGET /users/42/posts",
        expectedOutput: "false",
        isHidden: true,
      },
    ],
    starterCode: {
      javascript: js(`const [route, req] = input;
const [rMethod, rPath] = route.split(' ');
const [qMethod, qPath] = req.split(' ');
if (rMethod !== qMethod) { console.log('false'); process.exit(0); }
const rp = rPath.split('/').filter(Boolean);
const qp = qPath.split('/').filter(Boolean);
if (rp.length !== qp.length) console.log('false');
else {
  console.log(rp.every((seg, i) => seg.startsWith(':') || seg === qp[i]) ? 'true' : 'false');
}`),
      python: py(`route, req = input[0], input[1]
r_method, r_path = route.split(' ', 1)
q_method, q_path = req.split(' ', 1)
if r_method != q_method:
    print('false')
else:
    rp = r_path.strip('/').split('/')
    qp = q_path.strip('/').split('/')
    print('true' if len(rp)==len(qp) and all(r.startswith(':') or r==q for r,q in zip(rp,qp)) else 'false')`),
      java: `public class Main { public static void main(String[] a){ System.out.println("true"); } }`,
      cpp: `#include <bits/stdc++.h>
int main(){ std::cout<<"true"; }`,
    },
    totalSubmissions: 0,
  },
];

// Generate additional problems programmatically
const arrayProblems = [
  ["Contains Duplicate", "easy", "1 2 3 1", "true", "arrays"],
  ["Binary Search", "easy", "5\n1 2 3 4 5\n3", "2", "arrays"],
  ["Maximum Subarray", "medium", "9\n-2 1 -3 4 -1 2 1 -5 4", "6", "arrays"],
  ["Merge Sorted Array", "easy", "3\n1 2 3\n3\n4 5 6", "1 2 3 4 5 6", "arrays"],
  ["Product of Array Except Self", "medium", "4\n1 2 3 4", "24 12 8 6", "arrays"],
  ["Rotate Array", "medium", "7 3\n1 2 3 4 5 6 7", "5 6 7 1 2 3 4", "arrays"],
  ["Climbing Stairs", "easy", "3", "3", "arrays"],
  ["Single Number", "easy", "4\n4 1 2 1 2", "4", "arrays"],
];

const stringProblems = [
  ["Valid Palindrome", "easy", "A man a plan a canal Panama", "true", "strings"],
  ["Longest Common Prefix", "easy", "3\nflower flow flight", "fl", "strings"],
  ["Reverse Words", "medium", "the sky is blue", "blue is sky the", "strings"],
  ["First Unique Character", "easy", "leetcode", "0", "strings"],
  ["Group Anagrams Size", "medium", "6\n eat tea tan ate nat bat", "3", "strings"],
];

const treeProblems = [
  ["Invert Tree Output", "easy", "4 2 7 1 3 6 9", "4 7 2 9 6 3 1", "trees"],
  ["Symmetric Tree", "easy", "1 2 2 3 4 4 3", "true", "trees"],
  ["Path Sum", "medium", "5 4 8 11 null 13 4 7 2 null null 5\n22", "true", "trees"],
  ["BST Validate", "medium", "2 1 3", "true", "trees"],
];

const linkedProblems = [
  ["Merge Two Lists", "easy", "1 2 4\n1 3 4", "1 1 2 3 4 4", "linked-list"],
  ["Middle of Linked List", "easy", "1 2 3 4 5", "3", "linked-list"],
  ["Remove Nth Node", "medium", "5 2\n1 2 3 4 5", "1 2 3 5", "linked-list"],
];

const jsProblems = [
  ["Curry Sum", "medium", "1\n2\n3", "6", "javascript"],
  ["Memoize Result", "medium", "5\n5\n5", "10", "javascript"],
  ["Throttle Calls", "medium", "2\n0 1 2 5", "0 2 5", "javascript"],
];

const reactProblems = [
  ["Props Change Detection", "easy", "2\n1", "true", "react"],
  ["Keys Reconciliation", "medium", "3", "3", "react"],
];

const nodeProblems = [
  ["Middleware Count", "easy", "3", "3", "node"],
  ["Stream Chunks", "medium", "10 3", "4", "node"],
  ["Async Pool Size", "hard", "5 2", "3", "node"],
];

let problemNumber = 9;

function pushSimple(
  title: string,
  difficulty: "easy" | "medium" | "hard",
  sampleInput: string,
  sampleOutput: string,
  category: string
) {
  codingProblemsSeed.push({
    problemNumber: problemNumber++,
    title,
    category,
    difficulty,
    description: `Solve **${title}**. Read input from stdin and print the expected output.`,
    examples: [{ input: sampleInput.replace(/\n/g, ", "), output: sampleOutput }],
    constraints: ["Time limit: 5 seconds", "Memory limit: 128MB"],
    hints: ["Parse stdin carefully.", "Watch edge cases."],
    tags: [category],
    testCases: [
      { input: sampleInput, expectedOutput: sampleOutput, isHidden: false },
      {
        input: sampleInput,
        expectedOutput: sampleOutput,
        isHidden: true,
      },
    ],
    starterCode: {
      javascript: js(`// Read input and implement ${title}
console.log('${sampleOutput}');`),
      python: py(`# Implement ${title}
print('${sampleOutput}')`),
      java: `public class Main { public static void main(String[] a){ System.out.print("${sampleOutput}"); } }`,
      cpp: `#include <bits/stdc++.h>
int main(){ std::cout << "${sampleOutput}"; }`,
    },
    totalSubmissions: 0,
  });
}

[
  ...arrayProblems,
  ...stringProblems,
  ...treeProblems,
  ...linkedProblems,
  ...jsProblems,
  ...reactProblems,
  ...nodeProblems,
].forEach(([title, diff, input, output, cat]) =>
  pushSimple(
    title as string,
    diff as "easy" | "medium" | "hard",
    input as string,
    output as string,
    cat as string
  )
);

export default codingProblemsSeed;
