/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

 @IsTest
public with sharing class TestStampingHelper
{
    @IsTest
    static void getStamps()
    {
        StampingHelper sh = new StampingHelper();

        Test.startTest();

        sh.addStamps('Burst', 'Burst', '<svg></svg>');

        List<DA_Stamps__mdt> stamps = sh.getTestStamps();

        Test.stopTest();

        System.assertNotEquals(0, stamps.size());
    }
}
