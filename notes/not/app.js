// ============================================================
// 🛡️ TAMNY - Complete Firebase App
// ============================================================

// ============================================================
// 🔥 Firebase Imports
// ============================================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    setDoc,
    addDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ============================================================
// 🔥 Firebase Config
// ============================================================

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDeV5vyczMxxhhyKXXltJGPbDU_JFJujkU",
  authDomain: "tamny-security-test.firebaseapp.com",
  projectId: "tamny-security-test",
  storageBucket: "tamny-security-test.firebasestorage.app",
  messagingSenderId: "1013673633549",
  appId: "1:1013673633549:web:2ef6e0da24db55cb04f244",
  measurementId: "G-CQ81DWNMHC"
};


// ============================================================
// 🔥 Initialize Firebase
// ============================================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// Debug
window.testAuth = auth;
window.testDb = db;


// ============================================================
// 💾 Local Storage Keys
// ============================================================

const USER_KEY = "tamny_user";
const FAMILY_KEY = "tamny_family";
const SAFE_KEY = "tamny_safe";
const INITIAL_KEY = "tamny_initial";


// ============================================================
// 🎯 Elements
// ============================================================

const setupScreen =
    document.getElementById("setupScreen");

const homeScreen =
    document.getElementById("homeScreen");

const userIdElement =
    document.getElementById("userId");

const familyInfo =
    document.getElementById("familyInfo");

const familyMembers =
    document.getElementById("familyMembers");

const initialSection =
    document.getElementById("initialSection");

const nameInitial =
    document.getElementById("nameInitial");

const saveInitialBtn =
    document.getElementById("saveInitialBtn");

const leaveFamilyBtn =
    document.getElementById("leaveFamilyBtn");

const safeSection =
    document.getElementById("safeSection");

    const safeBtn =
    document.getElementById("safeBtn");

const safeStatus =
    document.getElementById("safeStatus");


// ============================================================
// 💬 Comments
// ============================================================

const commentsList =
    document.getElementById("commentsList");

const sendCommentBtn =
    document.getElementById("sendCommentBtn");

const commentInitial =
    document.getElementById("commentInitial");

const commentUserNumber =
    document.getElementById("commentUserNumber");

const commentText =
    document.getElementById("commentText");


// ============================================================
// 🔘 Main Buttons
// ============================================================

const createUserBtn =
    document.getElementById("createUserBtn");

const createFamilyButton =
    document.getElementById("createFamilyBtn");

const joinFamilyButton =
    document.getElementById("joinFamilyBtn");

const installAppBtn =
    document.getElementById("installAppBtn");


// ============================================================
// 🔄 Listeners
// ============================================================

let familyUnsubscribe = null;
let commentsUnsubscribe = null;

let appStarted = false;
let appStarting = false;


// ============================================================
// 🛡️ Escape HTML
// ============================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;
}


// ============================================================
// 🆔 Create User ID
// ============================================================

function createUserId() {

    return Math.floor(
        100000 +
        Math.random() * 900000
    ).toString();
}


// ============================================================
// 🔐 Ensure User Document
// ============================================================

async function ensureUserDocument() {

    const currentUser =
        auth.currentUser;

    if (!currentUser) {
        return false;
    }

    const userRef =
        doc(
            db,
            "users",
            currentUser.uid
        );

    try {

        const snapshot =
            await getDoc(userRef);

        if (snapshot.exists()) {

            const data =
                snapshot.data();

            let userId =
                data.userId;

            if (
                typeof userId === "string" &&
                /^\d{6}$/.test(userId)
            ) {

                localStorage.setItem(
                    USER_KEY,
                    userId
                );

                return true;
            }

            userId =
                createUserId();

            await setDoc(
                userRef,
                {
                    userId
                },
                {
                    merge: true
                }
            );

            localStorage.setItem(
                USER_KEY,
                userId
            );

            return true;
        }


        let userId =
            localStorage.getItem(USER_KEY);

        if (
            !userId ||
            !/^\d{6}$/.test(userId)
        ) {

            userId =
                createUserId();
        }

        await setDoc(
            userRef,
            {
                userId,
                createdAt:
                    serverTimestamp()
            }
        );

        localStorage.setItem(
            USER_KEY,
            userId
        );

     


        return true;

    } catch (error) {

        console.error(
            "Ensure User Error:",
            error
        );

        return false;
    }
}


// ============================================================
// 🔐 Firebase Startup
// ============================================================

async function startFirebase() {

    if (
        appStarted ||
        appStarting
    ) {
        return;
    }

    appStarting = true;

    try {

       

        if (!auth.currentUser) {

            const result =
                await signInAnonymously(auth);

        }


        if (!auth.currentUser) {

            throw new Error(
                "Firebase user غير موجود."
            );
        }


        const ready =
            await ensureUserDocument();

        if (!ready) {

            throw new Error(
                "تعذر إنشاء بيانات المستخدم."
            );
        }


        await loadApp();

        appStarted = true;

       

    } catch (error) {

        console.error(
            "Firebase Startup Error:",
            error
        );

        alert(
            "❌ تعذر تشغيل التطبيق.\n\n" +
            error.message
        );

    } finally {

        appStarting = false;
    }
}


// ============================================================
// 👤 Auth State
// ============================================================

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

          

            return;
        }

        

        if (!appStarted) {

            await loadApp();
        }
    }
);


// ============================================================
// 🚀 Load App
// ============================================================

async function loadApp() {

    const currentUser =
        auth.currentUser;

    if (!currentUser) {
        return;
    }


    const ready =
        await ensureUserDocument();

    if (!ready) {
        return;
    }


    const userId =
        localStorage.getItem(USER_KEY) || "";


    if (userIdElement) {

        userIdElement.textContent =
            userId;
    }


    if (setupScreen) {

        setupScreen.classList.add(
            "hidden"
        );
    }


    if (homeScreen) {

        homeScreen.classList.remove(
            "hidden"
        );
    }


    loadInitial();

    loadSafeStatus();

    await loadFamily();

    await loadCommentUserData();

    watchPublicComments();
}


// ============================================================
// 👤 Create User Button
// ============================================================

if (createUserBtn) {

    createUserBtn.addEventListener(
        "click",
        async () => {

            const ready =
                await ensureUserDocument();

            if (!ready) {

                alert(
                    "❌ حدث خطأ أثناء إنشاء المستخدم."
                );

                return;
            }

            await loadApp();
        }
    );
}


// ============================================================
// 🔐 Family Code Generator
// ============================================================


async function findMyFamily() {

    const currentUser = auth.currentUser;

    if (!currentUser) {
        return null;
    }

    try {

        const familiesSnapshot =
            await getDocs(
                collection(db, "families")
            );

        for (const familyDoc of familiesSnapshot.docs) {

            const memberRef = doc(
                db,
                "families",
                familyDoc.id,
                "members",
                currentUser.uid
            );

            const memberSnapshot =
                await getDoc(memberRef);

            if (memberSnapshot.exists()) {

                return {
                    id: familyDoc.id,
                    ...familyDoc.data()
                };
            }
        }

        return null;

    } catch (error) {

        console.error(
            "Find Family Error:",
            error
        );

        return null;
    }
}




// ==================================================
// 🔎 Find My Family
// ==================================================



async function loadFamily() {

    const currentUser = auth.currentUser;

    if (!currentUser) {
       
        return;
    }

    try {

      

        const family = await findMyFamily();

        // =========================================
        // لا توجد عائلة
        // =========================================

        if (!family) {

           
            


            localStorage.removeItem(FAMILY_KEY);

            if (familyInfo) {
                familyInfo.innerHTML = `
                    <div class="family-empty">
                        <p>👨‍👩‍👧 أنت لست داخل عائلة حاليًا.</p>
                    </div>
                `;
            }

            if (initialSection) {
                initialSection.classList.add("hidden");
            }

            if (safeSection) {
                safeSection.classList.add("hidden");
            }

            if (leaveFamilyBtn) {
                leaveFamilyBtn.classList.add("hidden");
            }

            if (familyMembers) {
                familyMembers.innerHTML = "";
            }

            return;
        }

        // =========================================
        // حفظ العائلة
        // =========================================

        localStorage.setItem(
            FAMILY_KEY,
            JSON.stringify(family)
        );

       


        // =========================================
        // عرض معلومات العائلة
        // =========================================

        if (familyInfo) {

            familyInfo.innerHTML = `
                <div class="family-info-box">

                    <h3>
                        👨‍👩‍👧 ${escapeHTML(
                            family.name || "عائلتي"
                        )}
                    </h3>

                    <p>
                        🔐 كود العائلة:
                        <strong>
                            ${escapeHTML(
                                family.code || "--------"
                            )}
                        </strong>
                    </p>

                    <p class="member-count">
                        👥 عدد الأعضاء: 0
                    </p>

                </div>
            `;
        }

        // =========================================
        // إظهار الأقسام
        // =========================================

        if (initialSection) {
            initialSection.classList.remove("hidden");
        }

        if (safeSection) {
            safeSection.classList.remove("hidden");
        }

        if (leaveFamilyBtn) {
            leaveFamilyBtn.classList.remove("hidden");
        }

        // =========================================
        // معرفة صاحب العائلة
        // =========================================

        const owner =
            family.createdBy === currentUser.uid;

       

        // =========================================
        // مراقبة الأعضاء
        // =========================================

        watchFamilyMembers(
    family.id,
    owner
);

watchMyFamilyMembership(
    family.id
);

        // =========================================
        // تحميل الحرف
        // =========================================

        loadInitial();

        // =========================================
        // تحميل حالة الأمان
        // =========================================

        loadSafeStatus();

    } catch (error) {

        console.error(
            "❌ Load Family Error:",
            error
        );

        if (familyInfo) {

            familyInfo.innerHTML = `
                <div class="error-message">
                    ❌ تعذر تحميل بيانات العائلة.
                </div>
            `;
        }
    }
}



// ============================================================
// 👨‍👩‍👧 Render Family Info
// ============================================================

function renderFamilyInfo(
    family,
    isOwner
) {

    if (!familyInfo) {
        return;
    }


    familyInfo.innerHTML = `

        <div class="family-header">

            <h3>
                👨‍👩‍👧 ${escapeHTML(
                    family.name ||
                    "عائلتي"
                )}
            </h3>

            <div class="family-code">

                🔑 كود العائلة:

                <strong>
                    ${escapeHTML(
                        family.code ||
                        "--------"
                    )}
                </strong>

            </div>

            <div class="member-count">
                👥 عدد الأعضاء: 0
            </div>

            ${
                isOwner
                    ? `
                        <div class="family-owner">
                            👑 أنت صاحب العائلة
                        </div>
                      `
                    : `
                        <div class="family-owner">
                            👤 عضو في العائلة
                        </div>
                      `
            }

        </div>

    `;
}


// ============================================================
// ❌ No Family
// ============================================================

function showNoFamily() {

    if (familyInfo) {

        familyInfo.innerHTML = `

            <div class="empty-family">

                👨‍👩‍👧
                أنت لست داخل عائلة حاليًا.

            </div>

        `;
    }


    if (familyMembers) {

        familyMembers.innerHTML = "";
    }
}


// ============================================================
// ❌ Family Error
// ============================================================

function showFamilyError() {

    if (familyInfo) {

        familyInfo.innerHTML = `

            <div class="error-message">

                ❌ تعذر تحميل بيانات العائلة.

            </div>

        `;
    }
}


// ==================================================
// 🔑 إنشاء كود عائلة عشوائي
// ==================================================

function createFamilyCode() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 8; i++) {

        code += chars[
            Math.floor(
                Math.random() * chars.length
            )
        ];

    }

    return code;
}

// ============================================================
// 🏠 Create Family
// ============================================================


async function createFamily() {

    const currentUser =
        auth.currentUser;


    if (!currentUser) {

        alert(
            "❌ Firebase لم يجهز بعد."
        );

        return;
    }


    // =========================================
    // التأكد من عدم وجود عائلة
    // =========================================

    const existingFamily =
        await findMyFamily();


    if (existingFamily) {

        alert(
            "⚠️ أنت داخل عائلة بالفعل."
        );

        return;
    }


    // =========================================
    // اسم العائلة
    // =========================================

    const nameInput =
        prompt(
            "أدخل اسم العائلة:",
            "عائلتي"
        );


    if (!nameInput) {
        return;
    }


    const familyName =
        nameInput.trim();


    if (!familyName) {

        alert(
            "❌ اسم العائلة غير صحيح."
        );

        return;
    }


    try {

        // =========================================
        // إنشاء الكود
        // =========================================

        const familyCode =
            createFamilyCode();


        // =========================================
        // إنشاء مرجع العائلة
        // =========================================

        const familyRef =
            doc(
                collection(
                    db,
                    "families"
                )
            );


        // =========================================
        // بيانات المستخدم
        // =========================================

        const userId =
            localStorage.getItem(
                USER_KEY
            ) || "";


        const initial =
            localStorage.getItem(
                INITIAL_KEY
            ) || "";


        // =========================================
        // كتابة العائلة + كود العائلة + العضو
        // كلها في نفس الوقت
        // =========================================

        const memberRef =
            doc(
                db,
                "families",
                familyRef.id,
                "members",
                currentUser.uid
            );


        const familyCodeRef =
            doc(
                db,
                "familyCodes",
                familyCode
            );


        await Promise.all([

            setDoc(
                familyRef,
                {
                    name:
                        familyName,

                    code:
                        familyCode,

                    createdBy:
                        currentUser.uid,

                    createdAt:
                        serverTimestamp()
                }
            ),


            setDoc(
                familyCodeRef,
                {
                    familyId:
                        familyRef.id,

                    createdBy:
                        currentUser.uid,

                    createdAt:
                        serverTimestamp()
                }
            ),


            setDoc(
                memberRef,
                {
                    uid:
                        currentUser.uid,

                    userId:
                        userId,

                    initial:
                        initial,

                    safe:
                        false,

                    safeAt:
                        null,

                    joinedAt:
                        Date.now(),

                    addedBy:
                        currentUser.uid
                }
            )

        ]);


        // =========================================
        // حفظ العائلة محليًا
        // =========================================

        const family = {

            id:
                familyRef.id,

            name:
                familyName,

            code:
                familyCode,

            createdBy:
                currentUser.uid
        };


        localStorage.setItem(
            FAMILY_KEY,
            JSON.stringify(family)
        );


        alert(
            "✅ تم إنشاء العائلة بنجاح.\n\n" +
            "كود العائلة:\n" +
            familyCode
        );


        // تحديث الواجهة بعد نجاح العملية
        loadFamily();


    } catch (error) {

        console.error(
            "Create Family Error:",
            error
        );


        alert(
            "❌ تعذر إنشاء العائلة.\n\n" +
            error.message
        );
    }
}




// ============================================================
// 🚪 Join Family
// ============================================================

// ==================================================
// 👨‍👩‍👧 Join Family
// ==================================================


async function joinFamily() {

    const currentUser =
        auth.currentUser;


    if (!currentUser) {

        alert(
            "❌ Firebase لم يجهز بعد."
        );

        return;
    }


    // =========================================
    // التأكد من وجود عائلة للمستخدم
    // =========================================

    const existingFamily =
        await findMyFamily();


    if (existingFamily) {

        alert(
            "⚠️ أنت داخل عائلة بالفعل."
        );

        return;
    }


    // =========================================
    // إدخال الكود
    // =========================================

    const input =
        prompt(
            "أدخل كود العائلة:"
        );


    if (!input) {
        return;
    }


    const familyCode =
        input
            .trim()
            .toUpperCase();


    if (
        !/^[A-Z0-9]{8}$/.test(
            familyCode
        )
    ) {

        alert(
            "❌ كود العائلة يجب أن يكون 8 أحرف أو أرقام."
        );

        return;
    }


    try {

        // =========================================
        // البحث عن الكود
        // =========================================

        const codeRef =
            doc(
                db,
                "familyCodes",
                familyCode
            );


        const codeSnapshot =
            await getDoc(
                codeRef
            );


        if (!codeSnapshot.exists()) {

            alert(
                "❌ لم يتم العثور على عائلة بهذا الكود."
            );

            return;
        }


        const codeData =
            codeSnapshot.data();


        const familyId =
            codeData.familyId;


        if (!familyId) {

            alert(
                "❌ كود العائلة غير صالح."
            );

            return;
        }


        // =========================================
        // المراجع
        // =========================================

        const familyRef =
            doc(
                db,
                "families",
                familyId
            );


        const memberRef =
            doc(
                db,
                "families",
                familyId,
                "members",
                currentUser.uid
            );


        // =========================================
        // قراءة العائلة والعضو معًا
        // =========================================

        const [
            familySnapshot,
            memberSnapshot
        ] = await Promise.all([

            getDoc(
                familyRef
            ),

            getDoc(
                memberRef
            )

        ]);


        if (!familySnapshot.exists()) {

            alert(
                "❌ العائلة غير موجودة."
            );

            return;
        }


        if (memberSnapshot.exists()) {

            alert(
                "⚠️ أنت موجود بالفعل في هذه العائلة."
            );

            return;
        }


        const family = {

            id:
                familySnapshot.id,

            ...familySnapshot.data()

        };


        // =========================================
        // بيانات المستخدم
        // =========================================

        const userId =
            localStorage.getItem(
                USER_KEY
            ) || "";


        if (
            !/^\d{6}$/.test(
                userId
            )
        ) {

            alert(
                "❌ لم يتم العثور على User ID صالح."
            );

            return;
        }


        const initial =
            localStorage.getItem(
                INITIAL_KEY
            ) || "";


        // =========================================
        // إضافة العضو
        // =========================================

        await setDoc(
            memberRef,
            {

                uid:
                    currentUser.uid,

                userId:
                    userId,

                initial:
                    initial,

                safe:
                    false,

                safeAt:
                    null,

                joinedAt:
                    Date.now(),

                addedBy:
                    family.createdBy

            }
        );


        // =========================================
        // حفظ العائلة
        // =========================================

        localStorage.setItem(
            FAMILY_KEY,

            JSON.stringify(
                family
            )
        );


        alert(
            "✅ تم الانضمام إلى العائلة بنجاح."
        );


        // لا ننتظر loadFamily
        loadFamily();


    } catch (error) {

        console.error(
            "Join Family Error:",
            error
        );


        alert(
            "❌ تعذر الانضمام إلى العائلة.\n\n" +
            error.message
        );
    }
}



// ============================================================
// 🔘 Family Buttons
// ============================================================

if (createFamilyButton) {

    createFamilyButton.addEventListener(
        "click",
        createFamily
    );
}


if (joinFamilyButton) {

    joinFamilyButton.addEventListener(
        "click",
        joinFamily
    );
}


// ============================================================
// 👨‍👩‍👧 Watch Family Members
// ============================================================

function watchFamilyMembers(
    familyId,
    isOwner = false
) {

    if (familyUnsubscribe) {

        familyUnsubscribe();

        familyUnsubscribe =
            null;
    }


    if (
        !familyMembers ||
        !familyId
    ) {
        return;
    }


    const membersRef =
        collection(
            db,
            "families",
            familyId,
            "members"
        );


    familyUnsubscribe =
        onSnapshot(

            membersRef,

            snapshot => {

                familyMembers.innerHTML =
                    "";


                const members =
                    snapshot.docs.map(
                        memberDoc => ({

                            id:
                                memberDoc.id,

                            ...memberDoc.data()

                        })
                    );


                if (familyInfo) {

                    const countElement =
                        familyInfo.querySelector(
                            ".member-count"
                        );

                    if (countElement) {

                        countElement.textContent =
                            `👥 عدد الأعضاء: ${members.length}`;
                    }
                }


                if (
                    members.length ===
                    0
                ) {

                    familyMembers.innerHTML = `

                        <div class="empty-family">

                            👨‍👩‍👧 لا يوجد أعضاء.

                        </div>

                    `;

                } else {

                    members.forEach(
                        member => {

                            renderMember(
                                member,
                                isOwner
                            );

                        }
                    );
                }


                if (isOwner) {

                    const addButton =
                        document.createElement(
                            "button"
                        );

                    addButton.type =
                        "button";

                    addButton.className =
                        "add-family-member-btn";

                    addButton.textContent =
                        "➕ إضافة عضو";

                    addButton.addEventListener(
                        "click",
                        addFamilyMember
                    );

                    familyMembers.appendChild(
                        addButton
                    );
                }

            },

            error => {

                console.error(
                    "Members Listener Error:",
                    error
                );

                familyMembers.innerHTML = `

                    <div class="error-message">

                        ❌ تعذر تحميل أعضاء العائلة.

                    </div>

                `;
            }
        );
}


// ============================================================
// 👤 Render Member
// ============================================================

function renderMember(
    member,
    isOwner = false
) {

    if (!familyMembers) {
        return;
    }


    const div =
        document.createElement("div");

    div.className =
        "member";


    const initial =
        member.initial || "•";


    const userId =
        member.userId || "------";


    const memberUid =
        member.uid ||
        member.id ||
        "";


    const currentUser =
        auth.currentUser;


    const isCurrentUser =
        currentUser &&
        memberUid ===
        currentUser.uid;


    let statusHTML = "";


    if (member.safe === true) {

        let safeTime =
            "الآن";


        if (member.safeAt) {

            try {

                safeTime =
                    new Date(
                        member.safeAt
                    ).toLocaleString(
                        "ar-EG"
                    );

            } catch {

                safeTime =
                    "الآن";
            }
        }


        statusHTML = `

            <div class="member-status safe">

                <span>
                    🟢 أنا بخير
                </span>

                <small>
                    آخر تحديث:
                    ${escapeHTML(
                        safeTime
                    )}
                </small>

            </div>

        `;

    } else {

        statusHTML = `

            <div class="member-status unknown">

                ⚪ لم يحدد حالته

            </div>

        `;
    }


    let removeButtonHTML =
        "";


    if (
        isOwner &&
        !isCurrentUser
    ) {

        removeButtonHTML = `

            <button
                type="button"
                class="remove-family-member-btn"
            >
                🗑️ إزالة
            </button>

        `;
    }


    div.innerHTML = `

        <div class="member-header">

            <div class="member-identity">

                <span class="member-avatar">

                    ${escapeHTML(
                        initial
                    )}

                </span>

                <div>

                    <strong>

                        👤 ${escapeHTML(
                            userId
                        )}

                    </strong>

                    ${
                        isCurrentUser
                            ? `
                                <small>
                                    أنت
                                </small>
                              `
                            : ""
                    }

                </div>

            </div>

            ${removeButtonHTML}

        </div>

        ${statusHTML}

    `;


    const removeButton =
        div.querySelector(
            ".remove-family-member-btn"
        );


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            async () => {

                await removeFamilyMember(
                    memberUid
                );
            }
        );
    }


    familyMembers.appendChild(
        div
    );
}


// ============================================================
// 👑 Check Family Owner
// ============================================================

async function isFamilyOwner(
    familyId
) {

    const currentUser =
        auth.currentUser;


    if (
        !currentUser ||
        !familyId
    ) {
        return false;
    }


    try {

        const familyRef =
            doc(
                db,
                "families",
                familyId
            );


        const snapshot =
            await getDoc(
                familyRef
            );


        if (!snapshot.exists()) {
            return false;
        }


        return (
            snapshot.data().createdBy ===
            currentUser.uid
        );

    } catch (error) {

        console.error(
            "Owner Check Error:",
            error
        );

        return false;
    }
}


// ============================================================
// ➕ Add Family Member
// ============================================================

async function addFamilyMember() {

    const saved =
        localStorage.getItem(
            FAMILY_KEY
        );


    if (!saved) {

        alert(
            "❌ أنت لست داخل عائلة."
        );

        return;
    }


    let family;


    try {

        family =
            JSON.parse(saved);

    } catch {

        alert(
            "❌ بيانات العائلة غير صحيحة."
        );

        return;
    }


    if (!family?.id) {

        alert(
            "❌ لم يتم العثور على العائلة."
        );

        return;
    }


    const owner =
        await isFamilyOwner(
            family.id
        );


    if (!owner) {

        alert(
            "❌ إضافة الأعضاء متاحة لصاحب العائلة فقط."
        );

        return;
    }


    const input =
        prompt(
            "أدخل User ID الخاص بالعضو:\n\nمثال: 123456"
        );


    if (!input) {
        return;
    }


    const userId =
        input.trim();


    if (!/^\d{6}$/.test(userId)) {

        alert(
            "❌ User ID يجب أن يكون 6 أرقام."
        );

        return;
    }


    const currentUser =
        auth.currentUser;


    if (!currentUser) {

        alert(
            "❌ Firebase لم يجهز بعد."
        );

        return;
    }


    try {

        const usersQuery =
            query(
                collection(
                    db,
                    "users"
                ),
                where(
                    "userId",
                    "==",
                    userId
                )
            );


        const userSnapshot =
            await getDocs(
                usersQuery
            );


        if (userSnapshot.empty) {

            alert(
                "❌ لم يتم العثور على مستخدم بهذا الرقم."
            );

            return;
        }


        const userDoc =
            userSnapshot.docs[0];


        const memberUid =
            userDoc.id;


        if (
            memberUid ===
            currentUser.uid
        ) {

            alert(
                "⚠️ هذا المستخدم هو أنت بالفعل."
            );

            return;
        }


        const memberRef =
            doc(
                db,
                "families",
                family.id,
                "members",
                memberUid
            );


        const memberSnapshot =
            await getDoc(
                memberRef
            );


        if (memberSnapshot.exists()) {

            alert(
                "⚠️ هذا المستخدم موجود بالفعل."
            );

            return;
        }


        await setDoc(
            memberRef,
            {
                uid:
                    memberUid,

                userId:
                    userId,

                initial:
                    "",

                safe:
                    false,

                safeAt:
                    null,

                joinedAt:
                    Date.now(),

                addedBy:
                    currentUser.uid
            }
        );


        alert(
            "✅ تمت إضافة العضو بنجاح."
        );


    } catch (error) {

        console.error(
            "Add Member Error:",
            error
        );

        alert(
            "❌ تعذر إضافة العضو.\n\n" +
            error.message
        );
    }
}


// ============================================================
// 🗑️ Remove Family Member
// ============================================================

async function removeFamilyMember(
    memberUid
) {

    const saved =
        localStorage.getItem(
            FAMILY_KEY
        );


    if (!saved) {
        return;
    }


    let family;


    try {

        family =
            JSON.parse(saved);

    } catch {

        return;
    }


    const currentUser =
        auth.currentUser;


    if (!currentUser) {

        alert(
            "❌ Firebase لم يجهز بعد."
        );

        return;
    }


    try {

        const familyRef =
            doc(
                db,
                "families",
                family.id
            );


        const familySnapshot =
            await getDoc(
                familyRef
            );


        if (!familySnapshot.exists()) {

            alert(
                "❌ العائلة غير موجودة."
            );

            return;
        }


        const familyData =
            familySnapshot.data();


        if (
            familyData.createdBy !==
            currentUser.uid
        ) {

            alert(
                "❌ إزالة الأعضاء متاحة لصاحب العائلة فقط."
            );

            return;
        }


        if (
            memberUid ===
            currentUser.uid
        ) {

            alert(
                "❌ لا يمكنك إزالة نفسك من هنا."
            );

            return;
        }


        const confirmed =
            confirm(
                "⚠️ هل أنت متأكد من إزالة هذا العضو؟"
            );


        if (!confirmed) {
            return;
        }


        await deleteDoc(

            doc(
                db,
                "families",
                family.id,
                "members",
                memberUid
            )

        );


        alert(
            "✅ تمت إزالة العضو بنجاح."
        );


    } catch (error) {

        console.error(
            "Remove Member Error:",
            error
        );

        alert(
            "❌ تعذر إزالة العضو.\n\n" +
            error.message
        );
    }
}


// ============================================================
// 🚪 Leave Family
// ============================================================

async function leaveFamily() {

    const saved =
        localStorage.getItem(
            FAMILY_KEY
        );


    if (!saved) {

        alert(
            "❌ أنت لست داخل عائلة."
        );

        return;
    }


    let family;


    try {

        family =
            JSON.parse(saved);

    } catch {

        alert(
            "❌ بيانات العائلة غير صحيحة."
        );

        return;
    }


    const currentUser =
        auth.currentUser;


    if (!currentUser) {

        alert(
            "❌ Firebase لم يجهز بعد."
        );

        return;
    }


    // منع صاحب العائلة من المغادرة
    if (
        family.createdBy ===
        currentUser.uid
    ) {

        alert(
            "👑 أنت صاحب العائلة.\n\n" +
            "لا يمكنك مغادرة العائلة بهذه الطريقة."
        );

        return;
    }


    const confirmed =
        confirm(
            "⚠️ هل تريد مغادرة العائلة؟"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(

            doc(
                db,
                "families",
                family.id,
                "members",
                currentUser.uid
            )

        );


        localStorage.removeItem(
            FAMILY_KEY
        );

        localStorage.removeItem(
            SAFE_KEY
        );


        if (familyUnsubscribe) {

            familyUnsubscribe();

            familyUnsubscribe =
                null;
        }


        alert(
            "✅ تمت مغادرة العائلة بنجاح."
        );


        location.reload();


    } catch (error) {

        console.error(
            "Leave Family Error:",
            error
        );

        alert(
            "❌ تعذر مغادرة العائلة.\n\n" +
            error.message
        );
    }
}


if (leaveFamilyBtn) {

    leaveFamilyBtn.addEventListener(
        "click",
        leaveFamily
    );
}


// ============================================================
// 🔤 Load Initial
// ============================================================

function loadInitial() {

    if (!nameInitial) {
        return;
    }


    const initial =
        localStorage.getItem(
            INITIAL_KEY
        );


    nameInitial.value =
        initial || "";
}


// ============================================================
// 🔤 Save Initial
// ============================================================

if (saveInitialBtn) {

    saveInitialBtn.addEventListener(
        "click",
        async () => {

            const initial =
                nameInitial.value.trim();


            if (!initial) {

                alert(
                    "❌ اكتب حرفًا واحدًا."
                );

                return;
            }


            if (
                [...initial].length !== 1
            ) {

                alert(
                    "❌ يجب كتابة حرف واحد فقط."
                );

                return;
            }


            localStorage.setItem(
                INITIAL_KEY,
                initial
            );


            await updateMemberInitial(
                initial
            );


            if (commentInitial) {

                commentInitial.value =
                    initial;
            }


            alert(
                "✅ تم حفظ الحرف."
            );
        }
    );
}


// ============================================================
// 🔤 Update Member Initial
// ============================================================

async function updateMemberInitial(
    initial
) {

    const saved =
        localStorage.getItem(
            FAMILY_KEY
        );


    if (!saved) {
        return;
    }


    let family;


    try {

        family =
            JSON.parse(saved);

    } catch {

        return;
    }


    const currentUser =
        auth.currentUser;


    if (!currentUser) {
        return;
    }


    try {

        await setDoc(

            doc(
                db,
                "families",
                family.id,
                "members",
                currentUser.uid
            ),

            {
                uid:
                    currentUser.uid,

                initial:
                    initial
            },

            {
                merge:
                    true
            }
        );


    } catch (error) {

        console.error(
            "Update Initial Error:",
            error
        );

        alert(
            "❌ حدث خطأ أثناء حفظ الحرف."
        );
    }
}


// ============================================================
// 🟢 Safe Status
// ============================================================

if (safeBtn) {

    safeBtn.addEventListener(
        "click",
        async () => {

            const saved =
                localStorage.getItem(
                    FAMILY_KEY
                );


            if (!saved) {

                alert(
                    "❌ يجب أن تكون داخل عائلة أولًا."
                );

                return;
            }


            let family;


            try {

                family =
                    JSON.parse(saved);

            } catch {

                alert(
                    "❌ بيانات العائلة غير صحيحة."
                );

                return;
            }


            const currentUser =
                auth.currentUser;


            if (!currentUser) {

                alert(
                    "❌ Firebase لم يجهز بعد."
                );

                return;
            }


            safeBtn.disabled =
                true;


            const now =
                Date.now();


            try {

                await setDoc(

                    doc(
                        db,
                        "families",
                        family.id,
                        "members",
                        currentUser.uid
                    ),

                    {
                        uid:
                            currentUser.uid,

                        safe:
                            true,

                        safeAt:
                            now
                    },

                    {
                        merge:
                            true
                    }
                );


                localStorage.setItem(

                    SAFE_KEY,

                    JSON.stringify({

                        status:
                            "safe",

                        time:
                            now

                    })

                );


                loadSafeStatus();


                alert(
                    "🟢 تم تسجيل أنك بخير."
                );


            } catch (error) {

                console.error(
                    "Safe Status Error:",
                    error
                );

                alert(
                    "❌ تعذر تحديث حالتك.\n\n" +
                    error.message
                );

            } finally {

                safeBtn.disabled =
                    false;
            }
        }
    );
}


// ============================================================
// 🟢 Load Safe Status
// ============================================================

function loadSafeStatus() {

    if (!safeStatus) {
        return;
    }


    const saved =
        localStorage.getItem(
            SAFE_KEY
        );


    if (!saved) {

        safeStatus.textContent =
            "⚪ لم يتم تسجيل حالتك بعد.";

        return;
    }


    try {

        const data =
            JSON.parse(saved);


        if (
            data.status !== "safe" ||
            !data.time
        ) {

            safeStatus.textContent =
                "⚪ لم يتم تسجيل حالتك بعد.";

            return;
        }


        const date =
            new Date(data.time);


        safeStatus.textContent =
            "🟢 تم تسجيل أنك بخير — " +
            date.toLocaleString("ar-EG");


    } catch {

        safeStatus.textContent =
            "⚪ لم يتم تسجيل حالتك بعد.";
    }
}


// ============================================================
// 💬 Load Comment User Data
// ============================================================

async function loadCommentUserData() {

    const currentUser =
        auth.currentUser;


    if (!currentUser) {
        return;
    }


    try {

        const ready =
            await ensureUserDocument();


        if (!ready) {
            return;
        }


        const userId =
            localStorage.getItem(
                USER_KEY
            ) || "";


        if (commentUserNumber) {

            commentUserNumber.value =
                userId;

            commentUserNumber.readOnly =
                true;
        }


        let initial =
            localStorage.getItem(
                INITIAL_KEY
            ) || "";


        if (!initial) {

            const familySaved =
                localStorage.getItem(
                    FAMILY_KEY
                );


            if (familySaved) {

                try {

                    const family =
                        JSON.parse(
                            familySaved
                        );


                    if (family?.id) {

                        const memberSnapshot =
                            await getDoc(

                                doc(
                                    db,
                                    "families",
                                    family.id,
                                    "members",
                                    currentUser.uid
                                )

                            );


                        if (
                            memberSnapshot.exists()
                        ) {

                            initial =
                                memberSnapshot
                                    .data()
                                    .initial ||
                                "";
                        }
                    }

                } catch (error) {

                    console.error(
                        "Read Initial Error:",
                        error
                    );
                }
            }
        }


        if (initial) {

            localStorage.setItem(
                INITIAL_KEY,
                initial
            );
        }


        if (commentInitial) {

            commentInitial.value =
                initial;
        }


    } catch (error) {

        console.error(
            "Comment User Data Error:",
            error
        );
    }
}


// ============================================================
// 📤 Send Comment
// ============================================================

if (sendCommentBtn) {

    sendCommentBtn.addEventListener(
        "click",
        async () => {

            const currentUser =
                auth.currentUser;


            if (!currentUser) {

                alert(
                    "❌ Firebase لم يجهز بعد."
                );

                return;
            }


            const ready =
                await ensureUserDocument();


            if (!ready) {

                alert(
                    "❌ تعذر الحصول على رقم المستخدم."
                );

                return;
            }


            const userNumber =
                localStorage.getItem(
                    USER_KEY
                ) || "";


            const initial =
                localStorage.getItem(
                    INITIAL_KEY
                ) ||
                commentInitial?.value.trim() ||
                "";


            const text =
                commentText?.value.trim() ||
                "";


            if (
                !/^\d{6}$/.test(
                    userNumber
                )
            ) {

                alert(
                    "❌ رقم المستخدم غير صحيح."
                );

                return;
            }


            if (!initial) {

                alert(
                    "❌ احفظ أول حرف من اسمك أولًا."
                );

                return;
            }


            if (
                [...initial].length !== 1
            ) {

                alert(
                    "❌ يجب أن يكون الحرف حرفًا واحدًا فقط."
                );

                return;
            }


            if (!text) {

                alert(
                    "❌ اكتب المعلومة أولًا."
                );

                return;
            }


            if (text.length > 500) {

                alert(
                    "❌ الحد الأقصى 500 حرف."
                );

                return;
            }


            sendCommentBtn.disabled =
                true;


            try {

                await addDoc(

                    collection(
                        db,
                        "comments"
                    ),

                    {
                        uid:
                            currentUser.uid,

                        userId:
                            userNumber,

                        initial:
                            initial,

                        text:
                            text,

                        createdAt:
                            serverTimestamp()
                    }
                );


                if (commentText) {

                    commentText.value =
                        "";
                }


                alert(
                    "✅ تم نشر المعلومة."
                );


            } catch (error) {

                console.error(
                    "Add Comment Error:",
                    error
                );

                alert(
                    "❌ تعذر نشر المعلومة.\n\n" +
                    error.message
                );

            } finally {

                sendCommentBtn.disabled =
                    false;
            }
        }
    );
}


// ============================================================
// 👀 Watch Public Comments
// ============================================================

function watchPublicComments() {

    if (!commentsList) {
        return;
    }


    if (commentsUnsubscribe) {

        commentsUnsubscribe();

        commentsUnsubscribe =
            null;
    }


    const commentsQuery =
        query(

            collection(
                db,
                "comments"
            ),

            orderBy(
                "createdAt",
                "desc"
            )

        );


    commentsUnsubscribe =
        onSnapshot(

            commentsQuery,

            snapshot => {

                commentsList.innerHTML =
                    "";


                if (snapshot.empty) {

                    commentsList.innerHTML = `

                        <div class="empty-comments">

                            💬 لا توجد معلومات حتى الآن.

                        </div>

                    `;

                    return;
                }


                snapshot.forEach(
                    commentDoc => {

                        renderPublicComment(
                            commentDoc.id,
                            commentDoc.data()
                        );
                    }
                );

            },

            error => {

                console.error(
                    "Comments Listener Error:",
                    error
                );

                commentsList.innerHTML = `

                    <div class="error-message">

                        ❌ تعذر تحميل المعلومات.

                    </div>

                `;
            }
        );
}


// ============================================================
// 💬 Render Comment
// ============================================================

function renderPublicComment(
    commentId,
    data
) {

    if (!commentsList) {
        return;
    }


    const div =
        document.createElement("div");


    div.className =
        "public-comment";


    const initial =
        data.initial || "•";


    const userId =
        data.userId || "------";


    const text =
        data.text || "";


    let dateText =
        "منذ قليل";


    if (data.createdAt) {

        try {

            const date =
                data.createdAt.toDate
                    ? data.createdAt.toDate()
                    : new Date(
                        data.createdAt
                    );


            dateText =
                date.toLocaleString(
                    "ar-EG"
                );

        } catch {

            dateText =
                "منذ قليل";
        }
    }


    div.innerHTML = `

        <div class="comment-header">

            <div class="comment-user">

                <span class="comment-avatar">

                    ${escapeHTML(
                        initial
                    )}

                </span>

                <div>

                    <strong>

                        ${escapeHTML(
                            userId
                        )}

                    </strong>

                    <small>

                        ${escapeHTML(
                            dateText
                        )}

                    </small>

                </div>

            </div>

        </div>


        <div class="comment-body">

            ${escapeHTML(
                text
            )}

        </div>

    `;


    commentsList.appendChild(
        div
    );
}


// ============================================================
// 📱 PWA Install
// ============================================================

let deferredInstallPrompt =
    null;


window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredInstallPrompt =
            event;


        if (installAppBtn) {

            installAppBtn.hidden =
                false;
        }
    }
);


if (installAppBtn) {

    installAppBtn.addEventListener(
        "click",
        async () => {

            if (!deferredInstallPrompt) {

                alert(
                    "⚠️ التثبيت غير متاح حاليًا."
                );

                return;
            }


            const promptEvent =
                deferredInstallPrompt;


            deferredInstallPrompt =
                null;


            try {

                await promptEvent.prompt();


                const result =
                    await promptEvent.userChoice;


                if (
                    result.outcome ===
                    "accepted"
                ) {

                    installAppBtn.hidden =
                        true;
                }

            } catch (error) {

                console.error(
                    "Install Error:",
                    error
                );
            }
        }
    );
}


window.addEventListener(
    "appinstalled",
    () => {

      


        deferredInstallPrompt =
            null;


        if (installAppBtn) {

            installAppBtn.hidden =
                true;
        }
    }
);


// ============================================================
// 🌐 Online / Offline
// ============================================================

window.addEventListener(
    "online",
    () => {

        
    }
);


window.addEventListener(
    "offline",
    () => {

       
    }
);


// ============================================================
// 🧹 Cleanup
// ============================================================

window.addEventListener(
    "beforeunload",
    () => {

        if (familyUnsubscribe) {

            familyUnsubscribe();

            familyUnsubscribe =
                null;
        }


        if (commentsUnsubscribe) {

            commentsUnsubscribe();

            commentsUnsubscribe =
                null;
        }
    }
);


// ============================================================
// 🧪 Debug Functions
// ============================================================

window.tamny = {

    db,

    auth,

    loadApp,

    loadFamily,

    findMyFamily,

    createFamily,

    joinFamily,

    watchFamilyMembers,

    addFamilyMember,

    removeFamilyMember,

    leaveFamily,

    loadSafeStatus,

    watchPublicComments,

    ensureUserDocument,

    isFamilyOwner
};


// ============================================================
// 🧪 Console
// ============================================================




// ============================================================
// 🚀 START
// ============================================================

startFirebase();

function watchMyFamilyMembership(familyId) {

    const currentUser = auth.currentUser;

    if (!currentUser || !familyId) {
        return;
    }

    const memberRef = doc(
        db,
        "families",
        familyId,
        "members",
        currentUser.uid
    );

    onSnapshot(
        memberRef,

        snapshot => {

            // العضو تم حذفه
            if (!snapshot.exists()) {

               

                // حذف بيانات العائلة من الجهاز
                localStorage.removeItem(
                    FAMILY_KEY
                );

                localStorage.removeItem(
                    SAFE_KEY
                );

                // إخفاء أقسام العائلة
                if (initialSection) {
                    initialSection.classList.add("hidden");
                }

                if (safeSection) {
                    safeSection.classList.add("hidden");
                }

                if (leaveFamilyBtn) {
                    leaveFamilyBtn.classList.add("hidden");
                }

                if (familyMembers) {
                    familyMembers.innerHTML = "";
                }

                if (familyInfo) {

                    familyInfo.innerHTML = `
                        <div class="family-empty">
                            <p>
                                🚪 تمت إزالتك من العائلة.
                            </p>

                            <p>
                                يمكنك الانضمام إلى عائلة أخرى.
                            </p>
                        </div>
                    `;
                }

                return;
            }

            

        },

        error => {

            console.error(
                "Membership Watch Error:",
                error
            );

        }
    );
}
