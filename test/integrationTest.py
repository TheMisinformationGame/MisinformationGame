import os
import unittest
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.keys import Keys


class Test(unittest.TestCase):

    # declare variable to store the url to be visited
    base_url = ""
    # declare variable to store search term
    search_term = ""

    def setUp(self) -> None:

        path = os.getcwd()
        # declare and initialize driver
        self.driver = webdriver.Chrome(os.path.join(path, "chromedriver"))

        # browser loads in maximized window
        self.driver.maximize_window()
        # driver waits implicitly for 10 seconds, for the element under consideration to load
        self.driver.implicitly_wait(10)

    def testSample(self) -> None:

        # load a given url in browser window
        self.driver.get(self.base_url)

        # fetech the content with xpath
        content_list = self.driver.find_elements_by_xpath(
            "//h3/span[contains(text(),'')]/../..//table//td")
        item_list = []

        # collect the result in a dataframe
        df = pd.DataFrame(item_list)

        # find search box
        search_box = self.driver.find_element_by_id("")
        # enter the search term in the search textbox
        search_box.send_keys(self.search_term)

        # to search for the entered search term
        search_box.send_keys(Keys.RETURN)
        # to click on the first search result's link
<<<<<<< HEAD
<<<<<<< HEAD
        self.driver.find_element_by_xpath("").click()
        # switch to the new tab
        self.driver.switch_to.window(self.driver.window_handles[1])
        # to confirm if a certain page has loaded
        self.assertTrue(self.driver.title.startswith(""))
        # to confirm if a certain item is visible or not
        self.assertTrue(self.driver.find_element_by_id("").is_displayed())
=======
=======
>>>>>>> 96b6f50 (Add tests with credibility settings missing; Add tests with overall-ratio settings missing; Add tests with one sheet missing)
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
<<<<<<< HEAD
>>>>>>> 96b6f50 (Add tests with credibility settings missing; Add tests with overall-ratio settings missing; Add tests with one sheet missing)
=======
>>>>>>> 96b6f50 (Add tests with credibility settings missing; Add tests with overall-ratio settings missing; Add tests with one sheet missing)

    def shutDown(self) -> None:

        self.driver.quit()
<<<<<<< HEAD
=======


if __name__ == "__main__":
    test = Test()
    test.setUp()
    # test.testPages()
    # test.testUploadCorrect()
    # test.testUploadIncorrect()
    # test.testUploadCredibilitySettingsMissing()
    # test.testUploadOverallRatioSettingsMissing()
    test.UploadtestSheetMissing()
<<<<<<< HEAD
>>>>>>> 96b6f50 (Add tests with credibility settings missing; Add tests with overall-ratio settings missing; Add tests with one sheet missing)
=======
>>>>>>> 96b6f50 (Add tests with credibility settings missing; Add tests with overall-ratio settings missing; Add tests with one sheet missing)
