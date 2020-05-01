/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

@IsTest
public with sharing class TestFlowImageContentHelper
{
    @IsTest
    static void createContentVersion()
    {
		Test.startTest();
        
     	List<FlowImageContentHelper.ContentRequest> reqs = new List<FlowImageContentHelper.ContentRequest>();
        FlowImageContentHelper.ContentRequest cr1 = new FlowImageContentHelper.ContentRequest();
        cr1.base64image = 'data:image/png;base64,iVBORw0KGgoAAA=';
        cr1.fileName = 'Test.png';
        reqs.add(cr1);
        FlowImageContentHelper.ContentRequest cr2 = new FlowImageContentHelper.ContentRequest();
        cr2.base64image = 'data:image/jpg;base64,iVBORw0KGgoAAA=';
        cr2.fileName = 'Test.jpg';
        reqs.add(cr2);
        FlowImageContentHelper.saveBase64ToContent(reqs);
        
        List<ContentVersion> allContent = [SELECT Id
                                           FROM ContentVersion];
        Test.stopTest();
        
        System.assertEquals(2, allContent.size());
    }
}