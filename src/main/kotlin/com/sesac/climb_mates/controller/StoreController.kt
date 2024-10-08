package com.sesac.climb_mates.controller

import com.sesac.climb_mates.data.store.time.StoreTime
import com.sesac.climb_mates.data.store.img.StoreImage
import com.sesac.climb_mates.service.GroupingService
import com.sesac.climb_mates.service.StoreService
import jakarta.servlet.http.HttpSession
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.User
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

import org.springframework.ui.Model
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Controller
@RequestMapping("/store")
class StoreController(
    private val storeService: StoreService,
    private val groupingService: GroupingService,
) {
    @GetMapping("/info/{storeId}")
    fun infoPage(@PathVariable("storeId") storeId:Long, @RequestParam(name="date", defaultValue = "none")date:String, @AuthenticationPrincipal user:User, model: Model): String {
        var requestDate = date
        if(requestDate == "none"){
            requestDate = defaultLocalDate()
        }//날짜 설정

        val groupingListByStoreIdList = groupingService.getGroupingByStoreIdAndDate(storeId, LocalDate.parse(requestDate))
        groupingListByStoreIdList.forEach {
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            it.formattedDate = it.createdDate.format(formatter)
        }
        val storeData =  storeService.getStoreById(storeId)
        val menuData = storeService.getMenuByStoreId(storeId)
        val storeTimeData = storeService.getStoreTimeByStoreId(storeId).orElseGet {
            StoreTime(
                store = storeService.getStoreById(storeId),
                startTime = "10:00",
                endTime = "18:00",
                DoW = "월-금",
                breakEnd = "",
                breakStart = ""
            )
        }
        val storeImage = storeService.getStoreImageByStoreId(storeId)
        val myUsername = user.username

        model.addAttribute("storeData", storeData)
        model.addAttribute("storeTimeData", storeTimeData)
        model.addAttribute("mainImage", storeImage[0])
        model.addAttribute("storeImage", storeImage.subList(1,5))
        model.addAttribute("groupingList", groupingListByStoreIdList)
        model.addAttribute("groupCnt", groupingListByStoreIdList.size)
        model.addAttribute("today", defaultLocalDate())
        model.addAttribute("menuData", menuData)
        model.addAttribute("my_username", myUsername)

        return "store/info"
    }

    private fun defaultLocalDate(): String {
        val currentDate = LocalDate.now()
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
        val formattedDate = currentDate.format(formatter)
        return formattedDate
    }
}