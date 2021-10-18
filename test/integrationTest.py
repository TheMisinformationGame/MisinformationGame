import os
import time
import unittest
import pandas as pd
from selenium import webdriver
import selenium
from selenium.webdriver.common.keys import Keys
import subprocess


class Test(unittest.TestCase):

    # base_url = "https://misinformation-game-group-41.web.app"
    play_url = "https://misinformation-game.web.app/study/axsvxt37ctac6ltr"

    def setUp(self) -> None:

        path = os.getcwd()
        # declare and initialize driver
        while True:
            driver_choice = input(
                "please select the webdriver, chrome or firefox: \n")
            if driver_choice.lower() == "chrome":
                self.driver = webdriver.Chrome(
                    os.path.join(path, "chromedriver"))
                break
            elif driver_choice.lower() == "firefox":
                self.driver = webdriver.Firefox(
                    os.path.join(path, "geckodriver"))
                break
        subprocess.check_call("npm start", shell=True)

    def testPages(self) -> None:

        # browser loads in maximized window
        self.driver.maximize_window()

        # load a given url in browser window
        self.driver.get(self.base_url)
        time.sleep(2)

        # # fetech the content with xpath
        # content_list = self.driver.find_elements_by_xpath(
        #     "//h3/span[contains(text(),'')]/../..//table//td")
        # item_list = []

        # # collect the result in a dataframe
        # df = pd.DataFrame(item_list)

        # # find search box
        # search_box = self.driver.find_element_by_id("")
        # # enter the search term in the search textbox
        # search_box.send_keys(self.search_term)

        # # to search for the entered search term
        # search_box.send_keys(Keys.RETURN)
        # to click on the first search result's link
        try:
            pages = self.driver.find_elements_by_xpath(
                "//a[@class='px-4 py-2 m-0.5 hover:bg-blue-400 rounded font-sans text-white text-lg undefined']")
            # # switch to the new tab
            # self.driver.switch_to.window(self.driver.window_handles[1])
            # to confirm if a certain page has loaded
            for i in range(len(pages)):
                pages = self.driver.find_elements_by_xpath(
                    "//a[@class='px-4 py-2 m-0.5 hover:bg-blue-400 rounded font-sans text-white text-lg undefined']")
                pages[i].click()
                time.sleep(2)
                # get back to the home page
                self.driver.execute_script("window.history.go(-1)")
                time.sleep(2)

            print("Test of accessing each page passed!")
            # # to confirm if a certain item is visible or not
            # self.assertTrue(self.driver.find_element_by_id("").is_displayed())

        except:
            print(f"{pages[i].getText()} is unaccessible!")

    def testUploadCorrect(self) -> None:

        self.driver.maximize_window()

        self.driver.get(self.base_url)
        time.sleep(2)

        upload_page = self.driver.find_element_by_link_text("Upload")

        upload_page.click()
        time.sleep(2)

        upload_element = self.driver.find_element_by_xpath(
            "//input[@class='hidden fileSelector']")

        upload_element.send_keys(os.path.join(
            os.getcwd(), "StudyTemplate.xlsx"))
        time.sleep(5)
        try:
            self.driver.find_element_by_xpath("//span[text()='Success']")
            print("Test of uploading correct study file passed!")
        except:
            print("Test of uploading correct study file failed!")

    def testUploadIncorrect(self) -> None:

        self.driver.maximize_window()

        self.driver.get(self.base_url)
        time.sleep(2)

        upload_page = self.driver.find_element_by_link_text("Upload")

        upload_page.click()
        time.sleep(2)

        upload_element = self.driver.find_element_by_xpath(
            "//input[@class='hidden fileSelector']")

        upload_element.send_keys(os.path.join(
            os.getcwd(), "integrationTest.py"))
        time.sleep(5)
        try:
            self.driver.find_element_by_xpath("//span[text()='Success']")
            print("Test of uploading incorrect study file passed!")
        except:
            print("Test of uploading incorrect study file failed!")

    def testPlayGameLike(self) -> None:

        self.driver.maximize_window()

        self.driver.get(self.play_url)
        time.sleep(5)

        id_element = self.driver.find_element_by_xpath(
            "//input[@class='px-3 py-2 border border-gray-400 rounded-md justify-self-center bg-gray-100']"
        )
        id_element.send_keys("testID")
        time.sleep(2)

        try:
            continue_key = self.driver.find_element_by_xpath(
                "//div[text()='Continue']"
            )
            continue_key.click()
            time.sleep(5)
            print("Successfully enter the game ID")
        except:
            print("Fail to enter the game ID")

        time.sleep(10)
        try:
            continue_key2 = self.driver.find_element_by_xpath(
                "//a[text()='Continue']"
            )
            continue_key2.click()
            time.sleep(5)
            print("Successfully enter the info page")
        except:
            print("Fail to enter the info page")

        time.sleep(10)
        try:
            continue_key3 = self.driver.find_element_by_xpath(
                "//div[text()='Continue']"
            )
            continue_key3.click()
            time.sleep(5)
            print("Successfully start the game")
        except:
            print("Fail to start the game")

        time.sleep(5)
        try:
            like = self.driver.find_element_by_id("like")
            like.click()
            time.sleep(3)

            next_post1 = self.driver.find_elements_by_xpath(
                "//div[text()='Continue to Next Post']"
            )
            next_post1.click()
            print("Successfully like the post")
        except:
            print("Fail to like the post")

    def testPlayGameDisike(self) -> None:

        self.driver.maximize_window()

        self.driver.get(self.play_url)
        time.sleep(5)

        id_element = self.driver.find_element_by_xpath(
            "//input[@class='px-3 py-2 border border-gray-400 rounded-md justify-self-center bg-gray-100']"
        )
        id_element.send_keys("testID")
        time.sleep(2)

        try:
            continue_key = self.driver.find_element_by_xpath(
                "//div[text()='Continue']"
            )
            continue_key.click()
            time.sleep(5)
            print("Successfully enter the game ID")
        except:
            print("Fail to enter the game ID")

        time.sleep(10)
        try:
            continue_key2 = self.driver.find_element_by_xpath(
                "//a[text()='Continue']"
            )
            continue_key2.click()
            time.sleep(5)
            print("Successfully enter the info page")
        except:
            print("Fail to enter the info page")

        time.sleep(10)
        try:
            continue_key3 = self.driver.find_element_by_xpath(
                "//div[text()='Continue']"
            )
            continue_key3.click()
            time.sleep(5)
            print("Successfully start the game")
        except:
            print("Fail to start the game")

        time.sleep(5)
        try:
            dislike = self.driver.find_element_by_id("dislike")
            dislike.click()
            time.sleep(3)

            next_post2 = self.driver.find_elements_by_xpath(
                "//div[text()='Continue to Next Post']"
            )
            next_post2.click()
            print("Successfully dislike the post")
        except:
            print("Fail to dislike the post")

    def testPlayGameShare(self) -> None:

        self.driver.maximize_window()

        self.driver.get(self.play_url)
        time.sleep(5)

        id_element = self.driver.find_element_by_xpath(
            "//input[@class='px-3 py-2 border border-gray-400 rounded-md justify-self-center bg-gray-100']"
        )
        id_element.send_keys("testID")
        time.sleep(2)

        try:
            continue_key = self.driver.find_element_by_xpath(
                "//div[text()='Continue']"
            )
            continue_key.click()
            time.sleep(5)
            print("Successfully enter the game ID")
        except:
            print("Fail to enter the game ID")

        time.sleep(10)
        try:
            continue_key2 = self.driver.find_element_by_xpath(
                "//a[text()='Continue']"
            )
            continue_key2.click()
            time.sleep(5)
            print("Successfully enter the info page")
        except:
            print("Fail to enter the info page")

        time.sleep(10)
        try:
            continue_key3 = self.driver.find_element_by_xpath(
                "//div[text()='Continue']"
            )
            continue_key3.click()
            time.sleep(5)
            print("Successfully start the game")
        except:
            print("Fail to start the game")

        time.sleep(5)
        try:
            dislike = self.driver.find_element_by_id("share")
            dislike.click()
            time.sleep(3)

            next_post2 = self.driver.find_elements_by_xpath(
                "//div[text()='Continue to Next Post']"
            )
            next_post2.click()
            print("Successfully share the post")
        except:
            print("Fail to share the post")

    def testPlayGameFlag(self) -> None:

        self.driver.maximize_window()

        self.driver.get(self.play_url)
        time.sleep(5)

        id_element = self.driver.find_element_by_xpath(
            "//input[@class='px-3 py-2 border border-gray-400 rounded-md justify-self-center bg-gray-100']"
        )
        id_element.send_keys("testID")
        time.sleep(2)

        try:
            continue_key = self.driver.find_element_by_xpath(
                "//div[text()='Continue']"
            )
            continue_key.click()
            time.sleep(5)
            print("Successfully enter the game ID")
        except:
            print("Fail to enter the game ID")

        time.sleep(10)
        try:
            continue_key2 = self.driver.find_element_by_xpath(
                "//a[text()='Continue']"
            )
            continue_key2.click()
            time.sleep(5)
            print("Successfully enter the info page")
        except:
            print("Fail to enter the info page")

        time.sleep(10)
        try:
            continue_key3 = self.driver.find_element_by_xpath(
                "//div[text()='Continue']"
            )
            continue_key3.click()
            time.sleep(5)
            print("Successfully start the game")
        except:
            print("Fail to start the game")

        time.sleep(5)
        try:
            dislike = self.driver.find_element_by_id("flag")
            dislike.click()
            time.sleep(3)

            next_post2 = self.driver.find_elements_by_xpath(
                "//div[text()='Continue to Next Post']"
            )
            next_post2.click()
            print("Successfully flag the post")
        except:
            print("Fail to flag the post")

    def testPlayGameFlag(self) -> None:

        self.driver.maximize_window()

        self.driver.get(self.play_url)
        time.sleep(5)

        id_element = self.driver.find_element_by_xpath(
            "//input[@class='px-3 py-2 border border-gray-400 rounded-md justify-self-center bg-gray-100']"
        )
        id_element.send_keys("testID")
        time.sleep(2)

        try:
            continue_key = self.driver.find_element_by_xpath(
                "//div[text()='Continue']"
            )
            continue_key.click()
            time.sleep(5)
            print("Successfully enter the game ID")
        except:
            print("Fail to enter the game ID")

        time.sleep(10)
        try:
            continue_key2 = self.driver.find_element_by_xpath(
                "//a[text()='Continue']"
            )
            continue_key2.click()
            time.sleep(5)
            print("Successfully enter the info page")
        except:
            print("Fail to enter the info page")

        time.sleep(10)
        try:
            continue_key3 = self.driver.find_element_by_xpath(
                "//div[text()='Continue']"
            )
            continue_key3.click()
            time.sleep(5)
            print("Successfully start the game")
        except:
            print("Fail to start the game")

        time.sleep(5)
        try:
            dislike = self.driver.find_element_by_id("skip")
            dislike.click()
            time.sleep(3)

            next_post2 = self.driver.find_elements_by_xpath(
                "//div[text()='Continue to Next Post']"
            )
            next_post2.click()
            print("Successfully skip the post")
        except:
            print("Fail to skip the post")

    def testUploadCredibilitySettingsMissing(self) -> None:

        self.driver.maximize_window()

        self.driver.get(self.base_url)
        time.sleep(2)

        upload_page = self.driver.find_element_by_link_text("Upload")

        upload_page.click()
        time.sleep(2)

        upload_element = self.driver.find_element_by_xpath(
            "//input[@class='hidden fileSelector']")

        upload_element.send_keys(os.path.join(
            os.getcwd(), "StudyCredibilitySettingsMissing.xlsx"))
        time.sleep(5)
        try:
            self.driver.find_element_by_xpath(
                "//span[text()='Expected Source & Post Selection!D19 (Credibility Linear Slope) to contain a number, but instead it contained nothing: null']")
            print(
                "Test of uploading study file with credibility settings missing passed!")
        except:
            print(
                "Test of uploading study file with credibility settings missing failed!")

    def testUploadOverallRatioSettingsMissing(self) -> None:

        self.driver.maximize_window()

        self.driver.get(self.base_url)
        time.sleep(2)

        upload_page = self.driver.find_element_by_link_text("Upload")

        upload_page.click()
        time.sleep(2)

        upload_element = self.driver.find_element_by_xpath(
            "//input[@class='hidden fileSelector']")

        upload_element.send_keys(os.path.join(
            os.getcwd(), "StudyOverallRatioSettingsMissing.xlsx"))
        time.sleep(5)
        try:
            self.driver.find_element_by_xpath(
                "//span[text()='Expected Source & Post Selection!D14 (Overall-Ratio True Post Percentage) to contain a percentage, but instead it contained nothing: null']")
            print(
                "Test of uploading study file with overall-ratio settings missing passed!")
        except:
            print(
                "Test of uploading study file with overall-ratio settings missing failed!")

    def UploadtestSheetMissing(self) -> None:

        self.driver.maximize_window()

        self.driver.get(self.base_url)
        time.sleep(2)

        upload_page = self.driver.find_element_by_link_text("Upload")

        upload_page.click()
        time.sleep(2)

        upload_element = self.driver.find_element_by_xpath(
            "//input[@class='hidden fileSelector']")

        upload_element.send_keys(os.path.join(
            os.getcwd(), "StudyTemplateSheetSourcesMissing.xlsx"))
        time.sleep(5)
        try:
            self.driver.find_element_by_xpath(
                """//span[text()="Cannot read properties of undefined (reading 'getCell')"]""")
            print(
                "Test of uploading study file with one sheet missing passed!")
        except:
            print(
                "Test of uploading study file with one sheet missing failed!")

    def shutDown(self) -> None:

        self.driver.quit()


if __name__ == "__main__":
    test = Test()
    test.setUp()
    # test.testPages()
    # test.testUploadCorrect()
    # test.testUploadIncorrect()
    # test.testUploadCredibilitySettingsMissing()
    # test.testUploadOverallRatioSettingsMissing()
    # test.testPlayGameLike()
    # test.testPlayGameDislike()
    # test.testPlayGameShare()
    # test.testPlayGameSkip()
    # test.testPlayGameFlag()
    test.UploadtestSheetMissing()
