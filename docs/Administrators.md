---
title: Registering Administrators
showPath: true
---

# Administrators
In order for users to upload their own studies, they must first
be registered as administrators. This document outlines the
process for a user to be granted administrator privileges.

## 1. User Registration
Before a user can be made into an administrator, they must first
register with the application using their Google account. This
can be done by accessing the Admin Dashboard from the homepage.
You will then be prompted to sign in using Google. Once you click
the **Sign In with Google** button, you will be prompted to
select a Google account to authenticate with. Select the account
you wish to create studies using, and then you should be
redirected to the admin dashboard.

You should now see the error **You are not registered as an
admin**. If you do not see this error, then you are already
registered as an administrator. However, if you do see this
message, you will need to be registered through the Firebase
console.

### 1.1. Finding your User ID
To register yourself as an administrator, you will need to
know your user ID. Your User ID is displayed in the top-right
of the admin dashboard underneath your name. It should be a
long string of letters and numbers that looks similar to
`rdp1zSjlgiMTAj4t42ve4sE84CvL`.

## 2. Admin Registration
Administrators are registered through the Firebase console
through the **Firestore Database** tab on the left. If you
are the first administrator to be registered, then you will
have to create the **Admins** collection in Firestore.

### 2.1. Registering the first administrator
Press the **+ Start collection** button in the Firestore
Database tab. You will then be prompted to enter a
Collection ID. Enter `Admins` as the Collection ID,
and then press Next.

You will then be prompted to **Add it's first document**.
Enter your **User ID** in the **Document ID** field.
Enter `Name` into the **Field** entry, and enter your
name as the **Value** for the field. The **Type** for
the field should be set to `string`. Once you have
entered the Document ID, Field, and Value, press **Save**.

You should now be able to reload the admin dashboard, and
the **You are not registered as an admin** error should
be gone.

### 2.2. Registering additional administrators
Additional administrators can be registed by selecting
the **Admins** collection in the Firestore Database tab.
Once selected, you should be able to click the
**Add document** button in the second column.

You will then be prompted to **Add a document**.
Enter the **User ID** of the user you wish to register
in the **Document ID** field. Enter `Name` into the
**Field** entry, and enter the user's name as the **Value**
for the field. The **Type** for the field should be set
to `string`. Once you have entered the Document ID, Field,
and Value, press **Save**.

The user should now be able to reload the admin dashboard, and
the **You are not registered as an admin** error should
be gone.
